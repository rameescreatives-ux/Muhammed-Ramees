<?php
/* ============================================================================
   SHADOWX STUDIOS — ADMIN AUTHENTICATION
   ----------------------------------------------------------------------------
   Server-side session login. The password never reaches the browser and is
   only ever stored as a bcrypt hash, so reading the source gives an attacker
   nothing usable.

   Also handles:
     * CSRF tokens on every form that changes data
     * brute-force throttling (6 wrong tries -> 15 minute lockout)
     * idle timeout
   ========================================================================== */

require_once __DIR__ . '/config.php';

/* ---------------------------------------------------------------- session - */
function sx_session_start(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
          || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');

    session_name(SESSION_NAME);
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'httponly' => true,       // JavaScript cannot read the cookie
        'secure'   => $https,     // only sent over HTTPS when available
        'samesite' => 'Lax',      // blocks cross-site form posts
    ]);
    session_start();

    // idle timeout
    if (isset($_SESSION['last_seen']) && (time() - $_SESSION['last_seen']) > SESSION_IDLE_MAX) {
        sx_logout();
        session_start();
    }
    $_SESSION['last_seen'] = time();
}

function sx_is_logged_in(): bool
{
    sx_session_start();
    return !empty($_SESSION['admin']);
}

/** Use at the top of every protected page. */
function sx_require_login(): void
{
    if (!sx_is_logged_in()) {
        header('Location: login.php');
        exit;
    }
}

function sx_logout(): void
{
    sx_session_start();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

/* ------------------------------------------------------------- throttling - */
function sx_throttle_file(): string
{
    return SX_DATA . '/.login_attempts.json';
}

function sx_throttle_state(): array
{
    $f = sx_throttle_file();
    if (!is_file($f)) {
        return ['count' => 0, 'until' => 0];
    }
    $d = json_decode((string)file_get_contents($f), true);
    return is_array($d) ? $d + ['count' => 0, 'until' => 0] : ['count' => 0, 'until' => 0];
}

function sx_is_locked_out(): int
{
    $s = sx_throttle_state();
    $left = (int)$s['until'] - time();
    return $left > 0 ? $left : 0;
}

function sx_record_failure(): void
{
    $s = sx_throttle_state();
    $s['count'] = (int)$s['count'] + 1;
    if ($s['count'] >= LOGIN_MAX_ATTEMPTS) {
        $s['until'] = time() + LOGIN_LOCKOUT_SECS;
        $s['count'] = 0;
    }
    if (!is_dir(SX_DATA)) { @mkdir(SX_DATA, 0755, true); }
    @file_put_contents(sx_throttle_file(), json_encode($s), LOCK_EX);
}

function sx_clear_failures(): void
{
    @unlink(sx_throttle_file());
}

/* ------------------------------------------------------------------ login - */
/** Returns '' on success, or a message to show the user. */
function sx_attempt_login(string $user, string $pass): string
{
    if (($left = sx_is_locked_out()) > 0) {
        return 'Too many failed attempts. Try again in ' . ceil($left / 60) . ' minute(s).';
    }

    // hash_equals avoids leaking the username through timing
    $userOk = hash_equals(ADMIN_USER, $user);
    $passOk = password_verify($pass, ADMIN_HASH);

    if (!$userOk || !$passOk) {
        sx_record_failure();
        // deliberately vague: never reveal which half was wrong
        return 'Incorrect username or password.';
    }

    sx_clear_failures();
    sx_session_start();
    session_regenerate_id(true);          // stops session fixation
    $_SESSION['admin']     = ADMIN_USER;
    $_SESSION['last_seen'] = time();
    return '';
}

/* ------------------------------------------------------------------- CSRF - */
function sx_csrf_token(): string
{
    sx_session_start();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function sx_csrf_ok(?string $token): bool
{
    sx_session_start();
    return !empty($_SESSION['csrf'])
        && is_string($token)
        && hash_equals($_SESSION['csrf'], $token);
}

/** Call at the top of anything that writes. Dies with 403 if the token is bad. */
function sx_require_csrf(): void
{
    $t = $_POST['csrf'] ?? ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? null);
    if (!sx_csrf_ok($t)) {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode(['ok' => false, 'error' => 'Session expired — please reload the page and try again.']);
        exit;
    }
}

/* ----------------------------------------------------------- password set - */
/** Rewrites ADMIN_HASH inside includes/config.php. Returns '' or an error. */
function sx_change_password(string $current, string $new): string
{
    if (!password_verify($current, ADMIN_HASH)) {
        return 'Your current password is not correct.';
    }
    if (strlen($new) < 10) {
        return 'Use at least 10 characters.';
    }
    $file = __DIR__ . '/config.php';
    if (!is_writable($file)) {
        return 'config.php is not writable on the server, so the password cannot be changed from here.';
    }
    $hash = password_hash($new, PASSWORD_BCRYPT, ['cost' => 12]);
    $src  = (string)file_get_contents($file);
    $out  = preg_replace(
        "/const\s+ADMIN_HASH\s*=\s*'[^']*';/",
        "const ADMIN_HASH = '" . addcslashes($hash, "'\\") . "';",
        $src,
        1,
        $n
    );
    if (!$n || $out === null) {
        return 'Could not find the password line in config.php.';
    }
    return file_put_contents($file, $out, LOCK_EX) !== false
        ? ''
        : 'Could not write to config.php.';
}

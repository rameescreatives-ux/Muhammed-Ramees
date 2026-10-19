<?php
require_once __DIR__ . '/../includes/auth.php';

sx_session_start();
if (sx_is_logged_in()) {
    header('Location: index.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!sx_csrf_ok($_POST['csrf'] ?? null)) {
        $error = 'Your session expired. Please try again.';
    } else {
        $error = sx_attempt_login(
            trim((string)($_POST['user'] ?? '')),
            (string)($_POST['pass'] ?? '')
        );
        if ($error === '') {
            header('Location: index.php');
            exit;
        }
    }
}
$token = sx_csrf_token();
$lock  = sx_is_locked_out();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Sign in · ShadowX Studios</title>
<link rel="icon" href="../assets/img/shadowx-wordmark-dark.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600&family=Inter+Tight:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="admin.css">
</head>
<body class="login-body">

<main class="login-shell">
  <form class="login-card" method="post" autocomplete="on">
    <img src="../assets/img/shadowx-wordmark-light.png" alt="ShadowX Studios" class="login-logo" width="520" height="161">
    <h1>Admin sign in</h1>
    <p class="login-sub">Manage the projects shown on your website.</p>

    <?php if ($error !== ''): ?>
      <p class="alert alert-bad" role="alert"><?= htmlspecialchars($error, ENT_QUOTES) ?></p>
    <?php elseif ($lock > 0): ?>
      <p class="alert alert-bad" role="alert">Locked for <?= (int)ceil($lock / 60) ?> more minute(s).</p>
    <?php endif; ?>

    <input type="hidden" name="csrf" value="<?= htmlspecialchars($token, ENT_QUOTES) ?>">

    <label for="user">Username</label>
    <input id="user" name="user" type="text" required autocomplete="username"
           autocapitalize="none" spellcheck="false" autofocus>

    <label for="pass">Password</label>
    <input id="pass" name="pass" type="password" required autocomplete="current-password">

    <button type="submit" class="btn-admin btn-admin-solid btn-admin-block">Sign in</button>

    <a class="login-back" href="../index.php">← Back to the website</a>
  </form>
</main>

</body>
</html>

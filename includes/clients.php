<?php
/* ============================================================================
   SHADOWX STUDIOS — CLIENT LOGO STORAGE
   ----------------------------------------------------------------------------
   Same pattern as projects.php: a JSON file, atomic locked writes, and a
   renderer for the public page. Managed from /admin/clients.php.
   ========================================================================== */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/projects.php';   // reuses sx_new_id() and sx_slug()

define('SX_CLIENTS_FILE', SX_DATA . '/clients.json');

/* ---------------------------------------------------------------- load ---- */
function sx_load_clients(): array
{
    if (!is_file(SX_CLIENTS_FILE)) {
        return [];
    }
    $raw = file_get_contents(SX_CLIENTS_FILE);
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return [];
    }
    usort($data, fn($a, $b) => ($a['order'] ?? 999) <=> ($b['order'] ?? 999));
    return $data;
}

function sx_published_clients(): array
{
    return array_values(array_filter(
        sx_load_clients(),
        fn($c) => !empty($c['published']) && !empty($c['logo'])
    ));
}

function sx_find_client(string $id): ?array
{
    foreach (sx_load_clients() as $c) {
        if (($c['id'] ?? '') === $id) { return $c; }
    }
    return null;
}

/* ---------------------------------------------------------------- save ---- */
function sx_save_clients(array $clients): bool
{
    if (!is_dir(SX_DATA)) { @mkdir(SX_DATA, 0755, true); }

    $i = 1;
    foreach ($clients as &$c) { $c['order'] = $i++; }
    unset($c);

    $json = json_encode(
        array_values($clients),
        JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    if ($json === false) { return false; }

    $tmp = SX_CLIENTS_FILE . '.' . bin2hex(random_bytes(6)) . '.tmp';
    if (file_put_contents($tmp, $json, LOCK_EX) === false) { @unlink($tmp); return false; }
    if (!rename($tmp, SX_CLIENTS_FILE)) { @unlink($tmp); return false; }
    @chmod(SX_CLIENTS_FILE, 0644);
    return true;
}

/* ------------------------------------------------------------ normalise ---- */
function sx_normalise_client(array $in, ?array $existing = null): array
{
    $url = trim((string)($in['url'] ?? ''));
    // only allow real http(s) links — never javascript: or data:
    if ($url !== '' && !preg_match('#^https?://#i', $url)) {
        $url = 'https://' . ltrim($url, '/');
    }
    if ($url !== '' && !filter_var($url, FILTER_VALIDATE_URL)) {
        $url = '';
    }

    return [
        'id'         => $existing['id'] ?? sx_new_id(),
        'order'      => (int)($in['order'] ?? $existing['order'] ?? 999),
        'published'  => !empty($in['published']),
        'name'       => trim((string)($in['name'] ?? '')),
        'name_ar'    => trim((string)($in['name_ar'] ?? '')),
        'logo'       => trim((string)($in['logo'] ?? ($existing['logo'] ?? ''))),
        'url'        => $url,
        'updated_at' => gmdate('c'),
        'created_at' => $existing['created_at'] ?? gmdate('c'),
    ];
}

/* --------------------------------------------------------- public render -- */
/**
 * Renders the scrolling logo strip. The list is output twice so the CSS
 * animation can loop seamlessly (translateX(-50%) lands exactly on the
 * start of the second copy).
 */
function sx_render_clients(array $clients, string $lang = 'en', string $base = ''): string
{
    if (!$clients) { return ''; }

    $e  = fn($s) => htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $ar = $lang === 'ar';

    $one = '';
    foreach ($clients as $c) {
        $name = $ar && trim((string)($c['name_ar'] ?? '')) !== ''
              ? $c['name_ar']
              : ($c['name'] ?? '');
        $img = '<img src="' . $e($base . $c['logo']) . '" alt="' . $e($name) . '"'
             . ' loading="lazy" decoding="async">';

        if (!empty($c['url'])) {
            $one .= '<li class="cl-item"><a href="' . $e($c['url']) . '" target="_blank"'
                  . ' rel="noopener noreferrer" title="' . $e($name) . '">' . $img . '</a></li>';
        } else {
            $one .= '<li class="cl-item">' . $img . '</li>';
        }
    }

    // aria-hidden on the duplicate so screen readers read the list once
    return '<ul class="cl-track">' . $one . '</ul>'
         . '<ul class="cl-track" aria-hidden="true">' . $one . '</ul>';
}

/** True if this logo file is used by any client other than $exceptId. */
function sx_logo_in_use(string $logo, string $exceptId = ''): bool
{
    if ($logo === '') { return false; }
    foreach (sx_load_clients() as $c) {
        if (($c['id'] ?? '') === $exceptId) { continue; }
        if (($c['logo'] ?? '') === $logo) { return true; }
    }
    return false;
}

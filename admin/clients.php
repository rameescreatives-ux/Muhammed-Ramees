<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/clients.php';

sx_require_login();

$clients = sx_load_clients();
$token   = sx_csrf_token();
$live    = count(array_filter($clients, fn($c) => !empty($c['published'])));
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Clients · ShadowX Admin</title>
<link rel="icon" href="../assets/img/shadowx-wordmark-dark.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700&family=Inter+Tight:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="admin.css">
</head>
<body>

<header class="adm-top">
  <div class="adm-wrap adm-top-in">
    <a href="../index.php" class="adm-brand">
      <img src="../assets/img/shadowx-wordmark-light.png" alt="ShadowX Studios" width="520" height="161">
      <span class="adm-badge">Admin</span>
    </a>
    <nav class="adm-nav">
      <a href="index.php">Projects</a>
      <a href="clients.php" class="is-on">Clients</a>
    </nav>
    <nav class="adm-top-right">
      <a href="../index.php#clients" target="_blank" rel="noopener" class="btn-admin btn-admin-ghost">View site ↗</a>
      <a href="logout.php" class="btn-admin btn-admin-ghost">Sign out</a>
    </nav>
  </div>
</header>

<main class="adm-wrap adm-main">

  <div class="adm-head">
    <div>
      <h1>Client logos</h1>
      <p class="adm-sub">
        <span id="countAll"><?= count($clients) ?></span> total ·
        <span id="countLive"><?= $live ?></span> showing in the strip.
        Drag the <span class="adm-kbd">⠿</span> handle to set the order they scroll in.
      </p>
    </div>
    <button type="button" class="btn-admin btn-admin-solid" id="newBtn">+ Add client</button>
  </div>

  <div id="toast" class="adm-toast" role="status" aria-live="polite"></div>

  <ul class="adm-list cl-admin-list" id="list">
    <?php foreach ($clients as $c): ?>
      <li class="adm-row<?= empty($c['published']) ? ' is-hidden' : '' ?>"
          data-id="<?= htmlspecialchars($c['id'], ENT_QUOTES) ?>">
        <span class="adm-handle" title="Drag to reorder" draggable="true">⠿</span>
        <span class="adm-thumb adm-thumb-logo">
          <?php if (!empty($c['logo'])): ?>
            <img src="../<?= htmlspecialchars($c['logo'], ENT_QUOTES) ?>" alt="" loading="lazy">
          <?php else: ?>
            <span class="adm-thumb-empty">No logo</span>
          <?php endif; ?>
        </span>
        <span class="adm-info">
          <strong class="adm-title"><?= htmlspecialchars($c['name'] ?: 'Untitled', ENT_QUOTES) ?></strong>
          <span class="adm-meta">
            <?= !empty($c['url'])
                 ? htmlspecialchars($c['url'], ENT_QUOTES)
                 : '<span style="color:#6a696e">No link</span>' ?>
          </span>
        </span>
        <span class="adm-actions">
          <button type="button" class="chip chip-state" data-act="toggle">
            <?= empty($c['published']) ? 'Hidden' : 'Live' ?>
          </button>
          <button type="button" class="chip" data-act="edit">Edit</button>
          <button type="button" class="chip chip-danger" data-act="delete">Delete</button>
        </span>
      </li>
    <?php endforeach; ?>
  </ul>

  <p class="adm-empty" id="empty"<?= $clients ? ' hidden' : '' ?>>
    No client logos yet. Click <strong>Add client</strong> to add the first one.
  </p>

</main>

<!-- ============================ EDITOR DRAWER ============================ -->
<div class="adm-overlay" id="overlay" hidden></div>

<aside class="adm-drawer adm-drawer-sm" id="drawer" hidden aria-label="Edit client">
  <form id="form" class="adm-form">
    <header class="adm-drawer-top">
      <h2 id="drawerTitle">Add client</h2>
      <button type="button" class="adm-x" id="closeBtn" aria-label="Close">✕</button>
    </header>

    <div class="adm-drawer-body">

      <p class="adm-note">
        Logos look best as a <strong>PNG with a transparent or white background</strong>.
        They are shown at about 60&nbsp;px tall and scaled automatically.
      </p>

      <label>Logo <span class="req">required</span></label>
      <div class="adm-logo-pick">
        <div class="adm-logo-preview" id="logoPreview"><span>No logo yet</span></div>
        <div>
          <input type="file" id="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden>
          <button type="button" class="btn-admin btn-admin-ghost" id="pickBtn">Choose logo…</button>
          <p class="hint" id="logoHint">PNG, JPG, WEBP or GIF · up to 6 MB</p>
        </div>
      </div>

      <label for="f-name">Client name <span class="req">required</span></label>
      <input id="f-name" name="name" type="text" required placeholder="Blue Water Ornamental Fish">
      <p class="hint">Used as the image alt text, so it matters for SEO and screen readers.</p>

      <label for="f-name-ar">Client name in Arabic</label>
      <input id="f-name-ar" name="name_ar" type="text" dir="rtl" placeholder="اختياري">
      <p class="hint">Optional — falls back to the English name.</p>

      <label for="f-url">Website link</label>
      <input id="f-url" name="url" type="text" placeholder="https://example.com">
      <p class="hint">Optional. If set, the logo becomes a clickable link that opens in a new tab.</p>

    </div>

    <footer class="adm-drawer-foot">
      <label class="adm-switch">
        <input type="checkbox" id="f-published" checked>
        <span>Show in the strip</span>
      </label>
      <div class="adm-foot-btns">
        <button type="button" class="btn-admin btn-admin-ghost" id="cancelBtn">Cancel</button>
        <button type="submit" class="btn-admin btn-admin-solid" id="saveBtn">Save client</button>
      </div>
    </footer>
  </form>
</aside>

<script>
  window.SX_ADMIN = {
    csrf: <?= json_encode($token) ?>,
    clients: <?= json_encode(array_values($clients), JSON_UNESCAPED_UNICODE) ?>
  };
</script>
<script src="clients.js"></script>
</body>
</html>

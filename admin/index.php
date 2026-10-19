<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/projects.php';

sx_require_login();

$projects = sx_load_projects();
$token    = sx_csrf_token();
$live     = count(array_filter($projects, fn($p) => !empty($p['published'])));
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Projects · ShadowX Admin</title>
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
    <nav class="adm-top-right">
      <a href="../index.php" target="_blank" rel="noopener" class="btn-admin btn-admin-ghost">View site ↗</a>
      <button type="button" class="btn-admin btn-admin-ghost" id="pwBtn">Change password</button>
      <a href="logout.php" class="btn-admin btn-admin-ghost">Sign out</a>
    </nav>
  </div>
</header>

<main class="adm-wrap adm-main">

  <div class="adm-head">
    <div>
      <h1>Projects</h1>
      <p class="adm-sub">
        <span id="countAll"><?= count($projects) ?></span> total ·
        <span id="countLive"><?= $live ?></span> showing on the site.
        Drag the <span class="adm-kbd">⠿</span> handle to reorder — the site follows this order.
      </p>
    </div>
    <button type="button" class="btn-admin btn-admin-solid" id="newBtn">+ Add project</button>
  </div>

  <div id="toast" class="adm-toast" role="status" aria-live="polite"></div>

  <ul class="adm-list" id="list">
    <?php foreach ($projects as $p): ?>
      <li class="adm-row<?= empty($p['published']) ? ' is-hidden' : '' ?>"
          data-id="<?= htmlspecialchars($p['id'], ENT_QUOTES) ?>" draggable="false">
        <span class="adm-handle" title="Drag to reorder" draggable="true">⠿</span>

        <span class="adm-thumb">
          <?php $first = $p['images'][0]['src'] ?? ''; ?>
          <?php if ($first): ?>
            <img src="../<?= htmlspecialchars($first, ENT_QUOTES) ?>" alt="" loading="lazy">
          <?php else: ?>
            <span class="adm-thumb-empty">No image</span>
          <?php endif; ?>
        </span>

        <span class="adm-info">
          <strong class="adm-title"><?= htmlspecialchars($p['title'] ?: 'Untitled', ENT_QUOTES) ?></strong>
          <span class="adm-meta"><?= htmlspecialchars($p['subtitle'] ?? '', ENT_QUOTES) ?></span>
          <span class="adm-tags">
            <?php foreach (array_slice($p['tags'] ?? [], 0, 4) as $t): ?>
              <em><?= htmlspecialchars($t, ENT_QUOTES) ?></em>
            <?php endforeach; ?>
            <?php if (empty($p['title_ar'])): ?><em class="warn">No Arabic</em><?php endif; ?>
          </span>
        </span>

        <span class="adm-actions">
          <button type="button" class="chip chip-state" data-act="toggle"
                  title="Show or hide this project on the website">
            <?= empty($p['published']) ? 'Hidden' : 'Live' ?>
          </button>
          <button type="button" class="chip" data-act="edit">Edit</button>
          <button type="button" class="chip chip-danger" data-act="delete">Delete</button>
        </span>
      </li>
    <?php endforeach; ?>
  </ul>

  <p class="adm-empty" id="empty"<?= $projects ? ' hidden' : '' ?>>
    No projects yet. Click <strong>Add project</strong> to create your first one.
  </p>

</main>

<!-- ============================ EDITOR DRAWER ============================ -->
<div class="adm-overlay" id="overlay" hidden></div>

<aside class="adm-drawer" id="drawer" hidden aria-label="Edit project">
  <form id="form" class="adm-form">
    <header class="adm-drawer-top">
      <h2 id="drawerTitle">Add project</h2>
      <button type="button" class="adm-x" id="closeBtn" aria-label="Close">✕</button>
    </header>

    <div class="adm-drawer-body">

      <div class="adm-tabs" role="tablist">
        <button type="button" class="adm-tab is-on" data-pane="en" role="tab">English</button>
        <button type="button" class="adm-tab" data-pane="ar" role="tab">العربية <span class="adm-opt">optional</span></button>
        <button type="button" class="adm-tab" data-pane="img" role="tab">Images</button>
      </div>

      <!-- ---------------------------------------------------- English ---- -->
      <section class="adm-pane is-on" data-pane="en">
        <label for="f-title">Project title <span class="req">required</span></label>
        <input id="f-title" name="title" type="text" required placeholder="Salkaara — Arabic Cuisine">

        <label for="f-subtitle">Subtitle</label>
        <input id="f-subtitle" name="subtitle" type="text" placeholder="Restaurant brand · Full identity system">
        <p class="hint">Shown in small type under the title.</p>

        <label for="f-tags">Tags</label>
        <input id="f-tags" name="tags" type="text" placeholder="Brand Identity, Packaging, F&amp;B">
        <p class="hint">Separate with commas. The first one is highlighted in orange.</p>

        <label for="f-body">Description</label>
        <textarea id="f-body" name="body" rows="8"
          placeholder="One paragraph per line.&#10;&#10;Leave a blank line between paragraphs if you like — blank lines are ignored."></textarea>
        <p class="hint">Each line becomes its own paragraph on the website.</p>

        <label for="f-did">What you delivered</label>
        <input id="f-did" name="deliverables" type="text" placeholder="Logo system, Packaging, Signage">
        <p class="hint">Comma separated. Appears as the small list under the description.</p>
      </section>

      <!-- ----------------------------------------------------- Arabic ---- -->
      <section class="adm-pane" data-pane="ar" dir="rtl">
        <p class="adm-note" dir="ltr">
          Anything you leave blank here falls back to the English text on the Arabic
          page, so you can fill this in later.
        </p>

        <label for="f-title-ar">العنوان</label>
        <input id="f-title-ar" name="title_ar" type="text" placeholder="صلكارا — المطبخ العربي">

        <label for="f-subtitle-ar">العنوان الفرعي</label>
        <input id="f-subtitle-ar" name="subtitle_ar" type="text" placeholder="علامة مطعم · نظام هوية متكامل">

        <label for="f-tags-ar">الوسوم</label>
        <input id="f-tags-ar" name="tags_ar" type="text" placeholder="هوية بصرية، تغليف">
        <p class="hint" dir="rtl">افصل بينها بفاصلة.</p>

        <label for="f-body-ar">الوصف</label>
        <textarea id="f-body-ar" name="body_ar" rows="8" placeholder="فقرة في كل سطر."></textarea>

        <label for="f-did-ar">ما تم تسليمه</label>
        <input id="f-did-ar" name="deliverables_ar" type="text" placeholder="نظام الشعار، التغليف">
      </section>

      <!-- ----------------------------------------------------- Images ---- -->
      <section class="adm-pane" data-pane="img">
        <p class="adm-note">
          The first two images show on the website, side by side. JPG, PNG, WEBP or
          GIF, up to 6&nbsp;MB — large files are resized automatically.
        </p>

        <div class="adm-drop" id="drop">
          <input type="file" id="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden>
          <p><strong>Drop images here</strong> or <button type="button" class="linkish" id="pickBtn">choose files</button></p>
          <p class="hint" id="dropHint">Nothing uploading.</p>
        </div>

        <ul class="adm-imgs" id="imgs"></ul>
      </section>

    </div>

    <footer class="adm-drawer-foot">
      <label class="adm-switch">
        <input type="checkbox" id="f-published" name="published" checked>
        <span>Show on the website</span>
      </label>
      <div class="adm-foot-btns">
        <button type="button" class="btn-admin btn-admin-ghost" id="cancelBtn">Cancel</button>
        <button type="submit" class="btn-admin btn-admin-solid" id="saveBtn">Save project</button>
      </div>
    </footer>
  </form>
</aside>

<!-- ========================= CHANGE PASSWORD ========================= -->
<aside class="adm-modal" id="pwModal" hidden>
  <form class="adm-modal-card" id="pwForm">
    <h2>Change password</h2>
    <p class="hint">Updates <code>includes/config.php</code> on the server.</p>
    <label for="pw-cur">Current password</label>
    <input id="pw-cur" type="password" required autocomplete="current-password">
    <label for="pw-new">New password</label>
    <input id="pw-new" type="password" required minlength="10" autocomplete="new-password">
    <p class="hint">At least 10 characters.</p>
    <div class="adm-foot-btns">
      <button type="button" class="btn-admin btn-admin-ghost" id="pwCancel">Cancel</button>
      <button type="submit" class="btn-admin btn-admin-solid">Update</button>
    </div>
  </form>
</aside>

<script>
  window.SX_ADMIN = {
    csrf: <?= json_encode($token) ?>,
    projects: <?= json_encode(array_values($projects), JSON_UNESCAPED_UNICODE) ?>
  };
</script>
<script src="admin.js"></script>
</body>
</html>

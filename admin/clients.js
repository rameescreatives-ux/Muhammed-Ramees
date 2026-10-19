/* ============================================================================
   SHADOWX STUDIOS — CLIENT LOGO MANAGER
   ----------------------------------------------------------------------------
   Same shape as admin.js but for the logo strip on the home page.
   Every request carries the CSRF token.
   ========================================================================== */
(function () {
  'use strict';

  var CFG     = window.SX_ADMIN || { csrf: '', clients: [] };
  var clients = CFG.clients.slice();

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var list    = $('#list');
  var drawer  = $('#drawer');
  var overlay = $('#overlay');
  var form    = $('#form');
  var fileEl  = $('#file');
  var toastEl = $('#toast');

  var editingId = null;   // null = adding a new client
  var logo      = '';     // path of the logo currently in the form

  /* ========================================================== utilities */
  var toastTimer;
  function toast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.className = 'adm-toast show ' + (kind || '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.className = 'adm-toast'; }, 3600);
  }

  function api(action, data, isForm) {
    var body;
    if (isForm) {
      body = data;
      body.append('action', action);
      body.append('csrf', CFG.csrf);
    } else {
      body = new FormData();
      body.append('action', action);
      body.append('csrf', CFG.csrf);
      Object.keys(data || {}).forEach(function (k) { body.append(k, data[k]); });
    }
    return fetch('api.php', { method: 'POST', body: body, credentials: 'same-origin' })
      .then(function (r) {
        return r.json().catch(function () {
          return { ok: false, error: 'Server returned an unexpected response.' };
        });
      })
      .then(function (j) {
        if (j && j.relogin) { window.location.href = 'login.php'; }
        return j;
      })
      .catch(function () { return { ok: false, error: 'Network error — is the server reachable?' }; });
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function byId(id) {
    for (var i = 0; i < clients.length; i++) { if (clients[i].id === id) return clients[i]; }
    return null;
  }

  function refreshCounts() {
    $('#countAll').textContent = clients.length;
    $('#countLive').textContent = clients.filter(function (c) { return c.published; }).length;
    $('#empty').hidden = clients.length > 0;
  }

  /* ====================================================== drawer open/close */
  function showLogo() {
    var box = $('#logoPreview');
    if (logo) {
      box.innerHTML = '<img src="../' + esc(logo) + '" alt="">';
      $('#logoHint').textContent = 'Choose another file to replace it.';
    } else {
      box.innerHTML = '<span>No logo yet</span>';
      $('#logoHint').textContent = 'PNG, JPG, WEBP or GIF · up to 6 MB';
    }
  }

  function openDrawer(id) {
    editingId = id || null;
    var c = id ? byId(id) : null;

    $('#drawerTitle').textContent = c ? 'Edit client' : 'Add client';
    form.reset();

    $('#f-name').value        = c ? (c.name || '') : '';
    $('#f-name-ar').value     = c ? (c.name_ar || '') : '';
    $('#f-url').value         = c ? (c.url || '') : '';
    $('#f-published').checked = c ? !!c.published : true;

    logo = c ? (c.logo || '') : '';
    showLogo();

    overlay.hidden = false;
    drawer.hidden  = false;
    document.body.style.overflow = 'hidden';
    setTimeout(function () { $('#f-name').focus(); }, 60);
  }

  function closeDrawer() {
    drawer.hidden  = true;
    overlay.hidden = true;
    document.body.style.overflow = '';
    editingId = null;
  }

  $('#newBtn').addEventListener('click', function () { openDrawer(null); });
  $('#closeBtn').addEventListener('click', closeDrawer);
  $('#cancelBtn').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !drawer.hidden) { closeDrawer(); }
  });

  /* ============================================================ logo upload */
  $('#pickBtn').addEventListener('click', function () { fileEl.click(); });

  fileEl.addEventListener('change', function () {
    if (!fileEl.files.length) { return; }
    var f = fileEl.files[0];
    fileEl.value = '';
    if (!/^image\//.test(f.type)) { toast('That file is not an image.', 'bad'); return; }

    var fd = new FormData();
    fd.append('image', f);
    fd.append('slug', ($('#f-name').value || 'client-logo').slice(0, 40));

    $('#logoHint').textContent = 'Uploading…';
    api('upload', fd, true).then(function (r) {
      if (!r.ok) { toast(r.error || 'The logo failed to upload.', 'bad'); showLogo(); return; }
      logo = r.src;
      showLogo();
      toast('Logo uploaded. Save to apply it.', 'good');
    });
  });

  /* ================================================================== save */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = $('#f-name').value.trim();
    if (!name) { $('#f-name').focus(); toast('Give the client a name first.', 'bad'); return; }
    if (!logo)  { toast('Choose a logo image first.', 'bad'); return; }

    var payload = {
      id: editingId || '',
      name: name,
      name_ar: $('#f-name-ar').value,
      url: $('#f-url').value,
      logo: logo,
      published: $('#f-published').checked
    };

    var btn = $('#saveBtn');
    btn.disabled = true;
    btn.textContent = 'Saving…';

    api('client_save', { client: JSON.stringify(payload) }).then(function (r) {
      btn.disabled = false;
      btn.textContent = 'Save client';
      if (!r.ok) { toast(r.error || 'Could not save.', 'bad'); return; }

      if (r.created) { clients.push(r.client); }
      else {
        for (var i = 0; i < clients.length; i++) {
          if (clients[i].id === r.client.id) { clients[i] = r.client; break; }
        }
      }
      renderList();
      closeDrawer();
      toast(r.created ? 'Client added — the logo is in the strip now.' : 'Changes saved.', 'good');
    });
  });

  /* ================================================================== list */
  function rowHtml(c) {
    return '<li class="adm-row' + (c.published ? '' : ' is-hidden') + '" data-id="' + esc(c.id) + '">' +
      '<span class="adm-handle" title="Drag to reorder" draggable="true">⠿</span>' +
      '<span class="adm-thumb adm-thumb-logo">' +
        (c.logo ? '<img src="../' + esc(c.logo) + '" alt="" loading="lazy">'
                : '<span class="adm-thumb-empty">No logo</span>') +
      '</span>' +
      '<span class="adm-info">' +
        '<strong class="adm-title">' + esc(c.name || 'Untitled') + '</strong>' +
        '<span class="adm-meta">' +
          (c.url ? esc(c.url) : '<span style="color:#6a696e">No link</span>') +
        '</span>' +
      '</span>' +
      '<span class="adm-actions">' +
        '<button type="button" class="chip chip-state" data-act="toggle">' +
          (c.published ? 'Live' : 'Hidden') + '</button>' +
        '<button type="button" class="chip" data-act="edit">Edit</button>' +
        '<button type="button" class="chip chip-danger" data-act="delete">Delete</button>' +
      '</span></li>';
  }

  function renderList() {
    list.innerHTML = clients.map(rowHtml).join('');
    bindDrag();
    refreshCounts();
  }

  list.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-act]');
    if (!btn) { return; }
    var row = btn.closest('.adm-row');
    var id  = row.dataset.id;
    var c   = byId(id);
    if (!c) { return; }

    if (btn.dataset.act === 'edit') { openDrawer(id); return; }

    if (btn.dataset.act === 'toggle') {
      api('client_toggle', { id: id }).then(function (r) {
        if (!r.ok) { toast(r.error || 'Could not change it.', 'bad'); return; }
        c.published = r.published;
        row.classList.toggle('is-hidden', !r.published);
        btn.textContent = r.published ? 'Live' : 'Hidden';
        refreshCounts();
        toast(r.published ? 'Now showing in the strip.' : 'Hidden from the strip.', 'good');
      });
      return;
    }

    if (btn.dataset.act === 'delete') {
      if (!confirm('Remove “' + (c.name || 'this client') + '” from the strip?\n\nThis cannot be undone.')) {
        return;
      }
      api('client_delete', { id: id }).then(function (r) {
        if (!r.ok) { toast(r.error || 'Could not delete.', 'bad'); return; }
        clients = clients.filter(function (x) { return x.id !== id; });
        renderList();
        toast('Removed “' + (r.name || c.name) + '”.', 'good');
      });
    }
  });

  /* ============================================================ reordering */
  var dragRow = null;

  function bindDrag() {
    $$('.adm-handle', list).forEach(function (h) {
      var row = h.closest('.adm-row');

      h.addEventListener('dragstart', function (e) {
        dragRow = row;
        row.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', row.dataset.id); } catch (err) {}
      });
      h.addEventListener('dragend', function () {
        if (dragRow) { dragRow.classList.remove('dragging'); }
        $$('.adm-row', list).forEach(function (r) { r.classList.remove('drag-over'); });
        dragRow = null;
        persistOrder();
      });
    });

    $$('.adm-row', list).forEach(function (row) {
      row.addEventListener('dragover', function (e) {
        if (!dragRow || dragRow === row) { return; }
        e.preventDefault();
        row.classList.add('drag-over');
        var box = row.getBoundingClientRect();
        var after = (e.clientY - box.top) > box.height / 2;
        list.insertBefore(dragRow, after ? row.nextSibling : row);
      });
      row.addEventListener('dragleave', function () { row.classList.remove('drag-over'); });
      row.addEventListener('drop', function (e) { e.preventDefault(); row.classList.remove('drag-over'); });
    });
  }

  function persistOrder() {
    var ids = $$('.adm-row', list).map(function (r) { return r.dataset.id; });
    var same = ids.length === clients.length && ids.every(function (id, i) { return clients[i].id === id; });
    if (same) { return; }

    clients = ids.map(byId).filter(Boolean);
    api('client_reorder', { ids: JSON.stringify(ids) }).then(function (r) {
      if (!r.ok) { toast(r.error || 'Could not save the new order.', 'bad'); }
      else { toast('Order saved — the strip scrolls in this order.', 'good'); }
    });
  }

  /* ================================================================== init */
  bindDrag();
  refreshCounts();
})();

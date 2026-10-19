/* ============================================================================
   SHADOWX STUDIOS — ADMIN DASHBOARD
   ----------------------------------------------------------------------------
   Talks to api.php. Every request carries the CSRF token.
   ========================================================================== */
(function () {
  'use strict';

  var CFG      = window.SX_ADMIN || { csrf: '', projects: [] };
  var projects = CFG.projects.slice();

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var list     = $('#list');
  var drawer   = $('#drawer');
  var overlay  = $('#overlay');
  var form     = $('#form');
  var imgsEl   = $('#imgs');
  var fileEl   = $('#file');
  var dropEl   = $('#drop');
  var dropHint = $('#dropHint');
  var toastEl  = $('#toast');

  var editingId = null;          // null = creating a new project
  var images    = [];            // [{src, alt}]

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
      .then(function (r) { return r.json().catch(function () { return { ok: false, error: 'Server returned an unexpected response.' }; }); })
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
    for (var i = 0; i < projects.length; i++) { if (projects[i].id === id) return projects[i]; }
    return null;
  }

  function refreshCounts() {
    $('#countAll').textContent = projects.length;
    $('#countLive').textContent = projects.filter(function (p) { return p.published; }).length;
    $('#empty').hidden = projects.length > 0;
  }

  /* ====================================================== drawer open/close */
  function openDrawer(id) {
    editingId = id || null;
    var p = id ? byId(id) : null;

    $('#drawerTitle').textContent = p ? 'Edit project' : 'Add project';
    form.reset();
    switchPane('en');

    $('#f-title').value       = p ? (p.title || '') : '';
    $('#f-subtitle').value    = p ? (p.subtitle || '') : '';
    $('#f-tags').value        = p ? (p.tags || []).join(', ') : '';
    $('#f-body').value        = p ? (p.body || []).join('\n') : '';
    $('#f-did').value         = p ? (p.deliverables || []).join(', ') : '';
    $('#f-title-ar').value    = p ? (p.title_ar || '') : '';
    $('#f-subtitle-ar').value = p ? (p.subtitle_ar || '') : '';
    $('#f-tags-ar').value     = p ? (p.tags_ar || []).join('، ') : '';
    $('#f-body-ar').value     = p ? (p.body_ar || []).join('\n') : '';
    $('#f-did-ar').value      = p ? (p.deliverables_ar || []).join('، ') : '';
    $('#f-published').checked = p ? !!p.published : true;

    images = p ? (p.images || []).map(function (i) { return { src: i.src, alt: i.alt || '' }; }) : [];
    renderImages();

    overlay.hidden = false;
    drawer.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(function () { $('#f-title').focus(); }, 60);
  }

  function closeDrawer() {
    drawer.hidden = true;
    overlay.hidden = true;
    document.body.style.overflow = '';
    editingId = null;
  }

  function switchPane(name) {
    $$('.adm-tab').forEach(function (t) { t.classList.toggle('is-on', t.dataset.pane === name); });
    $$('.adm-pane').forEach(function (s) { s.classList.toggle('is-on', s.dataset.pane === name); });
  }

  $$('.adm-tab').forEach(function (t) {
    t.addEventListener('click', function () { switchPane(t.dataset.pane); });
  });

  $('#newBtn').addEventListener('click', function () { openDrawer(null); });
  $('#closeBtn').addEventListener('click', closeDrawer);
  $('#cancelBtn').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!$('#pwModal').hidden) { $('#pwModal').hidden = true; }
      else if (!drawer.hidden) { closeDrawer(); }
    }
  });

  /* ================================================================ images */
  function renderImages() {
    if (!images.length) {
      imgsEl.innerHTML = '<li class="hint" style="padding:10px 2px">No images yet. The first two you add are the ones shown on the website.</li>';
      return;
    }
    imgsEl.innerHTML = images.map(function (im, i) {
      return '<li class="adm-img' + (i > 1 ? ' extra' : '') + '" data-i="' + i + '">' +
        '<img src="../' + esc(im.src) + '" alt="">' +
        '<label class="alt"><span>' + (i < 2 ? 'Shown on site · image ' + (i + 1) : 'Not shown (extra)') + '</span>' +
        '<input type="text" value="' + esc(im.alt) + '" data-alt="' + i + '" ' +
        'placeholder="Describe the image for Google and screen readers"></label>' +
        '<button type="button" class="rm" data-rm="' + i + '" title="Remove">✕</button>' +
        '</li>';
    }).join('');

    $$('[data-alt]', imgsEl).forEach(function (inp) {
      inp.addEventListener('input', function () { images[+inp.dataset.alt].alt = inp.value; });
    });
    $$('[data-rm]', imgsEl).forEach(function (b) {
      b.addEventListener('click', function () {
        var i = +b.dataset.rm;
        var src = images[i].src;
        images.splice(i, 1);
        renderImages();
        api('detach', { src: src, id: editingId || '' });
      });
    });
  }

  function uploadFiles(files) {
    var queue = Array.prototype.slice.call(files).filter(function (f) {
      return /^image\//.test(f.type);
    });
    if (!queue.length) { toast('Those files are not images.', 'bad'); return; }

    var done = 0;
    dropHint.textContent = 'Uploading 0 of ' + queue.length + '…';

    function next() {
      if (!queue.length) {
        dropHint.textContent = 'Nothing uploading.';
        renderImages();
        return;
      }
      var f = queue.shift();
      var fd = new FormData();
      fd.append('image', f);
      fd.append('slug', ($('#f-title').value || 'project').slice(0, 40));

      api('upload', fd, true).then(function (r) {
        done++;
        if (r.ok) {
          images.push({ src: r.src, alt: '' });
        } else {
          toast(r.error || 'One image failed to upload.', 'bad');
        }
        dropHint.textContent = 'Uploading ' + done + ' of ' + (done + queue.length) + '…';
        renderImages();
        next();
      });
    }
    next();
  }

  $('#pickBtn').addEventListener('click', function () { fileEl.click(); });
  fileEl.addEventListener('change', function () {
    if (fileEl.files.length) { uploadFiles(fileEl.files); fileEl.value = ''; }
  });

  ['dragenter', 'dragover'].forEach(function (ev) {
    dropEl.addEventListener(ev, function (e) { e.preventDefault(); dropEl.classList.add('over'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    dropEl.addEventListener(ev, function (e) { e.preventDefault(); dropEl.classList.remove('over'); });
  });
  dropEl.addEventListener('drop', function (e) {
    if (e.dataTransfer && e.dataTransfer.files.length) { uploadFiles(e.dataTransfer.files); }
  });

  /* ================================================================== save */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var title = $('#f-title').value.trim();
    if (!title) {
      switchPane('en');
      $('#f-title').focus();
      toast('Give the project a title first.', 'bad');
      return;
    }

    var payload = {
      id: editingId || '',
      title: title,
      subtitle: $('#f-subtitle').value,
      tags: $('#f-tags').value,
      body: $('#f-body').value,
      deliverables: $('#f-did').value,
      title_ar: $('#f-title-ar').value,
      subtitle_ar: $('#f-subtitle-ar').value,
      tags_ar: $('#f-tags-ar').value.replace(/،/g, ','),
      body_ar: $('#f-body-ar').value,
      deliverables_ar: $('#f-did-ar').value.replace(/،/g, ','),
      images: images,
      published: $('#f-published').checked
    };

    var btn = $('#saveBtn');
    btn.disabled = true;
    btn.textContent = 'Saving…';

    api('save', { project: JSON.stringify(payload) }).then(function (r) {
      btn.disabled = false;
      btn.textContent = 'Save project';
      if (!r.ok) { toast(r.error || 'Could not save.', 'bad'); return; }

      if (r.created) { projects.push(r.project); }
      else {
        for (var i = 0; i < projects.length; i++) {
          if (projects[i].id === r.project.id) { projects[i] = r.project; break; }
        }
      }
      renderList();
      closeDrawer();
      toast(r.created ? 'Project added — it is live on the site now.' : 'Changes saved.', 'good');
    });
  });

  /* ================================================================== list */
  function rowHtml(p) {
    var first = (p.images && p.images[0] && p.images[0].src) || '';
    var tags = (p.tags || []).slice(0, 4).map(function (t) { return '<em>' + esc(t) + '</em>'; }).join('');
    if (!p.title_ar) { tags += '<em class="warn">No Arabic</em>'; }
    return '<li class="adm-row' + (p.published ? '' : ' is-hidden') + '" data-id="' + esc(p.id) + '">' +
      '<span class="adm-handle" title="Drag to reorder" draggable="true">⠿</span>' +
      '<span class="adm-thumb">' +
        (first ? '<img src="../' + esc(first) + '" alt="" loading="lazy">'
               : '<span class="adm-thumb-empty">No image</span>') +
      '</span>' +
      '<span class="adm-info">' +
        '<strong class="adm-title">' + esc(p.title || 'Untitled') + '</strong>' +
        '<span class="adm-meta">' + esc(p.subtitle || '') + '</span>' +
        '<span class="adm-tags">' + tags + '</span>' +
      '</span>' +
      '<span class="adm-actions">' +
        '<button type="button" class="chip chip-state" data-act="toggle">' + (p.published ? 'Live' : 'Hidden') + '</button>' +
        '<button type="button" class="chip" data-act="edit">Edit</button>' +
        '<button type="button" class="chip chip-danger" data-act="delete">Delete</button>' +
      '</span></li>';
  }

  function renderList() {
    list.innerHTML = projects.map(rowHtml).join('');
    bindDrag();
    refreshCounts();
  }

  list.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-act]');
    if (!btn) { return; }
    var row = btn.closest('.adm-row');
    var id  = row.dataset.id;
    var p   = byId(id);
    if (!p) { return; }

    if (btn.dataset.act === 'edit') { openDrawer(id); return; }

    if (btn.dataset.act === 'toggle') {
      api('toggle', { id: id }).then(function (r) {
        if (!r.ok) { toast(r.error || 'Could not change it.', 'bad'); return; }
        p.published = r.published;
        row.classList.toggle('is-hidden', !r.published);
        btn.textContent = r.published ? 'Live' : 'Hidden';
        refreshCounts();
        toast(r.published ? 'Now showing on the website.' : 'Hidden from the website.', 'good');
      });
      return;
    }

    if (btn.dataset.act === 'delete') {
      if (!confirm('Delete “' + (p.title || 'this project') + '”?\n\nThis cannot be undone. Its uploaded images will be removed too.')) {
        return;
      }
      api('delete', { id: id }).then(function (r) {
        if (!r.ok) { toast(r.error || 'Could not delete.', 'bad'); return; }
        projects = projects.filter(function (x) { return x.id !== id; });
        renderList();
        toast('Deleted “' + (r.title || p.title) + '”.', 'good');
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
    var same = ids.length === projects.length && ids.every(function (id, i) { return projects[i].id === id; });
    if (same) { return; }

    projects = ids.map(byId).filter(Boolean);
    api('reorder', { ids: JSON.stringify(ids) }).then(function (r) {
      if (!r.ok) { toast(r.error || 'Could not save the new order.', 'bad'); }
      else { toast('Order saved — the website follows this order.', 'good'); }
    });
  }

  /* ========================================================= password modal */
  var pwModal = $('#pwModal');
  $('#pwBtn').addEventListener('click', function () {
    pwModal.hidden = false;
    setTimeout(function () { $('#pw-cur').focus(); }, 50);
  });
  $('#pwCancel').addEventListener('click', function () { pwModal.hidden = true; });
  pwModal.addEventListener('click', function (e) { if (e.target === pwModal) { pwModal.hidden = true; } });

  $('#pwForm').addEventListener('submit', function (e) {
    e.preventDefault();
    api('password', { current: $('#pw-cur').value, 'new': $('#pw-new').value }).then(function (r) {
      if (!r.ok) { toast(r.error || 'Could not change the password.', 'bad'); return; }
      pwModal.hidden = true;
      $('#pwForm').reset();
      toast('Password updated. Use the new one next time you sign in.', 'good');
    });
  });

  /* ================================================================== init */
  bindDrag();
  refreshCounts();
})();

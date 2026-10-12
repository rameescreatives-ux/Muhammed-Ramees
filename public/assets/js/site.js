/* Coroli site behaviour: menu, slider, show more, filters, scroll reveal, forms, chat. No dependencies. */
(function () {
  var C = window.COROLI || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---- mobile menu + dropdown
  var burger = $('.burger'), nav = $('#nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var o = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', o);
      document.body.style.overflow = o ? 'hidden' : '';
    });
    $$('#nav a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }); });
  }
  $$('.has-sub > button').forEach(function (b) {
    b.addEventListener('click', function () {
      var li = b.parentNode, o = li.classList.toggle('open');
      b.setAttribute('aria-expanded', o);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { $$('.has-sub.open').forEach(function (l) { l.classList.remove('open'); }); var p = $('#chat-panel'); if (p) p.hidden = true; }
  });

  // ---- hero slider
  var slides = $$('.slide'), dots = $$('.dots .dot');
  if (slides.length > 1) {
    var cur = 0, timer, rtl = document.documentElement.dir === 'rtl';
    var go = function (i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === cur); s.setAttribute('aria-hidden', k !== cur); });
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === cur); });
    };
    var play = function () { stop(); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(function () { go(cur + 1); }, 6500); };
    var stop = function () { clearInterval(timer); };
    var prev = $('.hnav.prev'), next = $('.hnav.next');
    if (prev) prev.addEventListener('click', function () { go(cur - 1); play(); });
    if (next) next.addEventListener('click', function () { go(cur + 1); play(); });
    dots.forEach(function (d) { d.addEventListener('click', function () { go(+d.dataset.i); play(); }); });
    var hero = $('.hero');
    hero.addEventListener('mouseenter', stop); hero.addEventListener('mouseleave', play);
    var sx = null;
    hero.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; stop(); }, { passive: true });
    hero.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(cur + ((dx < 0) !== rtl ? 1 : -1)); sx = null; play(); });
    go(0); play();
  }

  // ---- Show More on home range
  var mb = $('#more-btn'), more = $('#more');
  if (mb && more) {
    mb.addEventListener('click', function (e) {
      e.preventDefault();
      var open = more.hidden;
      more.hidden = !open;
      mb.textContent = open ? mb.dataset.less : mb.dataset.more;
      mb.setAttribute('aria-expanded', open);
      if (open) $$('.reveal', more).forEach(function (el) { el.classList.add('in'); });
    });
  }

  // ---- recipe filters
  var chips = $$('.filters .chip');
  chips.forEach(function (ch) {
    ch.addEventListener('click', function () {
      chips.forEach(function (x) { x.classList.toggle('is-active', x === ch); });
      $$('.fitem').forEach(function (it) { it.hidden = ch.dataset.f !== 'all' && it.dataset.p !== ch.dataset.f; });
    });
  });

  // ---- scroll reveal
  var rv = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    rv.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 60 + 'ms'; io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  // ---- broken remote image fallback
  $$('img').forEach(function (img) { img.addEventListener('error', function () { img.style.visibility = 'hidden'; }, { once: true }); });

  // ---- forms -> Supabase REST (insert only, protected by RLS)
  function post(table, row) {
    return fetch(C.sb.url + '/rest/v1/' + table, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: C.sb.key, Prefer: 'return=minimal' },
      body: JSON.stringify(row)
    }).then(function (r) { if (!r.ok) throw new Error(r.status); });
  }
  var okEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };
  function bind(form, build, table, msgs) {
    var out = $('.form-msg', form), btn = $('button[type=submit]', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      if (fd.get('website')) { out.textContent = msgs.ok; out.className = 'form-msg ok'; return; } // honeypot
      var name = (fd.get('name') || 'x').toString().trim(), email = (fd.get('email') || '').toString().trim();
      if (!name || !okEmail(email)) { out.textContent = msgs.required || msgs.err; out.className = 'form-msg err'; return; }
      var label = btn.textContent; btn.disabled = true; if (msgs.sending) btn.textContent = msgs.sending;
      post(table, build(fd)).then(function () { out.textContent = msgs.ok; out.className = 'form-msg ok'; form.reset(); })
        .catch(function () { out.textContent = msgs.err; out.className = 'form-msg err'; })
        .then(function () { btn.disabled = false; btn.textContent = label; });
    });
  }
  var g = function (fd, k, n) { var v = (fd.get(k) || '').toString().trim(); return v ? v.slice(0, n || 200) : null; };
  $$('.lead-form').forEach(function (f) {
    bind(f, function (fd) {
      return { kind: f.dataset.kind, name: g(fd, 'name', 120), company: g(fd, 'company', 160), email: g(fd, 'email', 160), phone: g(fd, 'phone', 40),
        product_interest: g(fd, 'product_interest', 120), quantity: g(fd, 'quantity', 80), message: g(fd, 'message', 2000), lang: C.lang, source_page: f.dataset.page };
    }, 'leads', C.msg);
  });
  $$('.news-form').forEach(function (f) {
    bind(f, function (fd) { return { email: g(fd, 'email', 160), lang: C.lang }; }, 'subscribers', { ok: C.news.ok, err: C.news.err, required: C.news.err });
  });

  // ---- chat helper panel (+ optional embed script from config)
  var cb = $('.chat-btn'), cp = $('#chat-panel');
  if (cb && cp) {
    cb.addEventListener('click', function () { cp.hidden = !cp.hidden; cb.setAttribute('aria-expanded', !cp.hidden); });
    var x = $('.chat-x'); if (x) x.addEventListener('click', function () { cp.hidden = true; cb.setAttribute('aria-expanded', 'false'); });
  }
  if (C.chat) { var s = document.createElement('script'); s.src = C.chat; s.async = true; document.body.appendChild(s); }
})();

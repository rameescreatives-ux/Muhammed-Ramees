/* ============================================================================
   SHADOWX STUDIOS — MAIN SCRIPT
   ----------------------------------------------------------------------------
   1. Sticky header
   2. Mobile drawer
   3. Scroll reveal
   4. Active nav link
   5. Lead submission  (Supabase + email + WhatsApp)  <- shared with chatbot.js
   6. Contact form wiring
   ========================================================================== */
(function () {
  'use strict';

  var CFG = window.SHADOWX || {};

  /* ========================================================
     1. STICKY HEADER
     ======================================================== */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('stuck', window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ========================================================
     2. MOBILE DRAWER
     ======================================================== */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  if (burger && drawer) {
    var setDrawer = function (open) {
      drawer.setAttribute('data-open', String(open));
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', function () {
      setDrawer(drawer.getAttribute('data-open') !== 'true');
    });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setDrawer(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.getAttribute('data-open') === 'true') setDrawer(false);
    });
  }

  /* ========================================================
     3. SCROLL REVEAL
     ======================================================== */
  var reveals = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ========================================================
     4. ACTIVE NAV LINK
     ======================================================== */
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (navLinks.length) {
    var sections = [];
    navLinks.forEach(function (a) {
      var el = document.querySelector(a.getAttribute('href'));
      if (el) sections.push({ link: a, el: el });
    });
    var markActive = function () {
      var cur = null;
      sections.forEach(function (s) {
        if (window.scrollY >= s.el.offsetTop - 160) cur = s.link;
      });
      navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
      if (cur) cur.setAttribute('aria-current', 'true');
    };
    window.addEventListener('scroll', markActive, { passive: true });
    markActive();
  }

  /* ========================================================
     5. LEAD SUBMISSION
     --------------------------------------------------------
     Called by the contact form AND the chatbot.
     Three destinations, in order of reliability:
       a) Supabase  — permanent record (needs keys in config.js)
       b) Email     — via the Supabase edge function (optional)
       c) WhatsApp  — opens a pre-filled chat so you see it instantly
     Returns a Promise that always resolves, never rejects, so a failed
     database write can never stop the WhatsApp handoff.
     ======================================================== */
  function buildWhatsAppText(lead) {
    var L = [];
    L.push('New enquiry from the ShadowX website');
    L.push('');
    if (lead.name)    L.push('Name: ' + lead.name);
    if (lead.company) L.push('Company: ' + lead.company);
    if (lead.email)   L.push('Email: ' + lead.email);
    if (lead.phone)   L.push('Phone: ' + lead.phone);
    if (lead.service) L.push('Needs: ' + lead.service);
    if (lead.budget)  L.push('Package: ' + lead.budget);
    if (lead.timeline)L.push('Timeline: ' + lead.timeline);
    if (lead.message) { L.push(''); L.push(lead.message); }
    L.push('');
    L.push('— sent from ' + (CFG.domain || window.location.origin));
    return L.join('\n');
  }

  function saveToSupabase(lead) {
    if (!CFG.supabaseUrl || !CFG.supabaseAnonKey) {
      return Promise.resolve({ stored: false, reason: 'not configured' });
    }
    var table = CFG.supabaseTable || 'shadowx_leads';
    return fetch(CFG.supabaseUrl.replace(/\/$/, '') + '/rest/v1/' + table, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': CFG.supabaseAnonKey,
        'Authorization': 'Bearer ' + CFG.supabaseAnonKey,
        'Prefer': 'return=minimal'
      },
      /* Column names here must match the shadowx_leads table.
         See supabase/schema.sql. */
      body: JSON.stringify({
        form:       lead.source   || 'website',
        name:       lead.name     || null,
        company:    lead.company  || null,
        email:      lead.email    || null,
        phone:      lead.phone    || null,
        service:    lead.service  || null,
        budget:     lead.budget   || null,
        timeline:   lead.timeline || null,
        message:    lead.message  || null,
        locale:     document.documentElement.lang || 'en',
        source_url: window.location.href.slice(0, 500),
        user_agent: (navigator.userAgent || '').slice(0, 500)
      })
    })
      .then(function (r) { return { stored: r.ok, status: r.status }; })
      .catch(function (err) { return { stored: false, reason: String(err) }; });
  }

  function notifyByEmail(lead) {
    // Optional. Needs the notify-lead edge function deployed (see supabase/README).
    if (!CFG.supabaseUrl || !CFG.supabaseAnonKey) return Promise.resolve({ emailed: false });
    return fetch(CFG.supabaseUrl.replace(/\/$/, '') + '/functions/v1/notify-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + CFG.supabaseAnonKey
      },
      body: JSON.stringify(lead)
    })
      .then(function (r) { return { emailed: r.ok }; })
      .catch(function () { return { emailed: false }; });
  }

  window.ShadowXLead = {
    /* submit(lead, { openWhatsApp: true }) */
    submit: function (lead, opts) {
      opts = opts || {};
      var jobs = [saveToSupabase(lead), notifyByEmail(lead)];
      return Promise.all(jobs).then(function (res) {
        if (opts.openWhatsApp !== false) {
          var url = 'https://wa.me/' + (CFG.whatsapp || '') +
                    '?text=' + encodeURIComponent(buildWhatsAppText(lead));
          window.open(url, '_blank', 'noopener');
        }
        return { stored: res[0].stored, emailed: res[1].emailed };
      });
    },
    whatsAppUrl: function (lead) {
      return 'https://wa.me/' + (CFG.whatsapp || '') +
             '?text=' + encodeURIComponent(buildWhatsAppText(lead));
    },
    mailtoUrl: function (lead) {
      return 'mailto:' + (CFG.email || '') +
             '?subject=' + encodeURIComponent('Project enquiry — ' + (lead.name || 'website')) +
             '&body=' + encodeURIComponent(buildWhatsAppText(lead));
    }
  };

  /* ========================================================
     6. CONTACT FORM
     ======================================================== */
  var form = document.getElementById('leadForm');
  var sent = document.getElementById('leadSent');
  if (form && sent) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var btn = form.querySelector('button[type=submit]');
      var original = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = 'Sending…';

      var data = new FormData(form);
      var lead = {
        name:    data.get('name'),
        company: data.get('company'),
        email:   data.get('email'),
        phone:   data.get('phone'),
        service: data.get('service'),
        budget:  data.get('budget'),
        message: data.get('message'),
        source:  'contact-form'
      };

      window.ShadowXLead.submit(lead, { openWhatsApp: false }).then(function () {
        form.style.display = 'none';
        sent.setAttribute('data-show', 'true');
        btn.disabled = false;
        btn.innerHTML = original;
      });
    });
  }

})();

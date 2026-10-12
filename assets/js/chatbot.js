/* ============================================================================
   SHADOWX STUDIOS — LEAD CHATBOT
   ----------------------------------------------------------------------------
   Rule-based, no API, no cost, never says anything you didn't write.

   Flow:  service -> budget -> timeline -> name -> contact -> hand off

   TO EDIT THE CONVERSATION: change the SCRIPT array below. Each step is
     { key, ask, options }           a question with tappable buttons
     { key, ask, input, validate }   a question with a text field
   Steps run in order. Answers are collected into `lead` and sent to
   window.ShadowXLead.submit() which stores them and opens WhatsApp.
   ========================================================================== */
(function () {
  'use strict';

  var CFG  = window.SHADOWX || {};
  var CHAT = CFG.chat || {};

  var fab   = document.getElementById('chatFab');
  var panel = document.getElementById('chatPanel');
  var body  = document.getElementById('chatBody');
  var opts  = document.getElementById('chatOpts');
  var form  = document.getElementById('chatForm');
  var input = document.getElementById('chatInput');
  var close = document.getElementById('chatClose');
  if (!fab || !panel || !body) return;

  /* ========================================================
     THE CONVERSATION — edit freely.
     A different language can override this whole array by setting
     window.SHADOWX.chat.script before this file loads (see config-ar.js).
     ======================================================== */
  var SCRIPT = CHAT.script || [
    {
      key: 'service',
      ask: 'What do you need building?',
      options: [
        'Logo & brand identity',
        'Brand book / guidelines',
        'Packaging design',
        'Company profile',
        'Website design & build',
        'Rebrand / refresh',
        'Not sure yet'
      ]
    },
    {
      key: 'budget',
      ask: 'Which package looks closest? You can change it later — this just tells me what to quote.',
      options: [
        'Launch — AED 1,999',
        'Identity — AED 2,999',
        'Complete — AED 4,999',
        'Bigger / custom scope',
        'Still deciding'
      ]
    },
    {
      key: 'timeline',
      ask: 'When do you need it?',
      options: ['As soon as possible', 'Within a month', '1–3 months', 'Just exploring']
    },
    {
      key: 'name',
      ask: 'Got it. What should I call you?',
      input: true,
      placeholder: 'Your name',
      validate: function (v) { return v.trim().length >= 2 || 'Just your first name is fine.'; }
    },
    {
      key: 'contact',
      ask: function (lead) {
        return 'Thanks ' + lead.name.split(' ')[0] + '. Last one — your WhatsApp number or email, so I can send the quote.';
      },
      input: true,
      placeholder: '+971 50 000 0000 or you@company.com',
      validate: function (v) {
        var s = v.trim();
        var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
        var okPhone = /^[+\d][\d\s()-]{6,}$/.test(s);
        return (okEmail || okPhone) || 'That does not look right — a phone number or an email, either is fine.';
      }
    }
  ];

  /* All bot wording in one place so a translation only has to override these. */
  var T = CHAT.text || {};
  var TXT = {
    sending:  T.sending  || 'Perfect — sending this over to Ramees now.',
    done:     T.done     || 'Done. You will get a reply shortly, usually within a couple of hours. I am opening WhatsApp so you can add anything else — a reference, a deadline, a photo of what you have already.',
    openWa:   T.openWa   || 'Open WhatsApp',
    openMail: T.openMail || 'Email instead',
    fallback: T.fallback || "Hi — a few quick questions and I'll get you a quote."
  };

  /* ========================================================
     STATE
     ======================================================== */
  var step = 0;
  var lead = { source: 'chatbot' };
  var started = false;
  var finished = false;

  /* ========================================================
     RENDERING
     ======================================================== */
  function scrollDown() { body.scrollTop = body.scrollHeight; }

  function bubble(text, who) {
    var el = document.createElement('div');
    el.className = 'bub ' + (who || 'bot');
    el.textContent = text;
    body.appendChild(el);
    scrollDown();
    return el;
  }

  function typing() {
    var el = document.createElement('div');
    el.className = 'typing';
    el.innerHTML = '<i></i><i></i><i></i>';
    body.appendChild(el);
    scrollDown();
    return el;
  }

  function botSay(text, delay, then) {
    var t = typing();
    setTimeout(function () {
      t.remove();
      bubble(text, 'bot');
      if (then) then();
    }, delay || 650);
  }

  function clearControls() {
    opts.innerHTML = '';
    form.setAttribute('data-show', 'false');
  }

  function showOptions(list, onPick) {
    clearControls();
    list.forEach(function (label) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.addEventListener('click', function () { onPick(label); });
      opts.appendChild(b);
    });
    scrollDown();
  }

  function showInput(placeholder, onSend) {
    clearControls();
    form.setAttribute('data-show', 'true');
    input.value = '';
    input.placeholder = placeholder || 'Type your answer…';
    form.onsubmit = function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!v) return;
      onSend(v);
    };
    setTimeout(function () { input.focus(); }, 120);
    scrollDown();
  }

  /* ========================================================
     FLOW
     ======================================================== */
  function runStep() {
    if (step >= SCRIPT.length) return finish();

    var s = SCRIPT[step];
    var question = (typeof s.ask === 'function') ? s.ask(lead) : s.ask;

    botSay(question, 700, function () {
      if (s.options) {
        showOptions(s.options, function (val) {
          bubble(val, 'me');
          lead[s.key] = val;
          clearControls();
          step++;
          setTimeout(runStep, 420);
        });
      } else {
        showInput(s.placeholder, function (val) {
          if (s.validate) {
            var check = s.validate(val);
            if (check !== true) { botSay(check, 420); return; }
          }
          bubble(val, 'me');
          lead[s.key] = val;
          clearControls();
          step++;
          setTimeout(runStep, 420);
        });
      }
    });
  }

  function finish() {
    if (finished) return;
    finished = true;
    clearControls();

    // Split the contact answer into email vs phone
    var c = (lead.contact || '').trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c)) { lead.email = c; } else { lead.phone = c; }

    botSay(TXT.sending, 600, function () {
      botSay(
        TXT.done,
        1100,
        function () {
          // Store the lead, then open WhatsApp pre-filled.
          if (window.ShadowXLead) {
            window.ShadowXLead.submit(lead, { openWhatsApp: true });
          }
          // Give a manual fallback in case the popup was blocked.
          clearControls();
          var wrap = document.createElement('div');
          wrap.style.cssText = 'padding:0 18px 16px; display:grid; gap:8px';

          var wa = document.createElement('a');
          wa.className = 'btn btn-solid btn-block btn-sm';
          wa.href = window.ShadowXLead ? window.ShadowXLead.whatsAppUrl(lead) : '#';
          wa.target = '_blank'; wa.rel = 'noopener';
          wa.textContent = TXT.openWa;

          var em = document.createElement('a');
          em.className = 'btn btn-line btn-block btn-sm';
          em.href = window.ShadowXLead ? window.ShadowXLead.mailtoUrl(lead) : '#';
          em.textContent = TXT.openMail;

          wrap.appendChild(wa); wrap.appendChild(em);
          opts.parentNode.insertBefore(wrap, form);
          scrollDown();
        }
      );
    });
  }

  function start() {
    if (started) return;
    started = true;
    botSay(CHAT.greeting || TXT.fallback, 500, function () {
      setTimeout(runStep, 400);
    });
  }

  /* ========================================================
     OPEN / CLOSE
     ======================================================== */
  function open() {
    panel.setAttribute('data-open', 'true');
    fab.setAttribute('data-hide', 'true');
    start();
  }
  function shut() {
    panel.setAttribute('data-open', 'false');
    fab.setAttribute('data-hide', 'false');
  }

  fab.addEventListener('click', open);
  if (close) close.addEventListener('click', shut);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.getAttribute('data-open') === 'true') shut();
  });

  // Any "Start a project" style button can open the chat instead by adding
  // data-open-chat to it.
  document.querySelectorAll('[data-open-chat]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); open(); });
  });

  /* Auto-open once, after the configured delay, if the visitor has not
     already dismissed it in this browser. */
  var AUTO = typeof CHAT.autoOpenAfter === 'number' ? CHAT.autoOpenAfter : 20000;
  if (AUTO > 0) {
    var seen = false;
    try { seen = sessionStorage.getItem('sx_chat_seen') === '1'; } catch (e) { /* private mode */ }
    if (!seen) {
      setTimeout(function () {
        if (panel.getAttribute('data-open') !== 'true') {
          open();
          try { sessionStorage.setItem('sx_chat_seen', '1'); } catch (e) {}
        }
      }, AUTO);
    }
  }

})();

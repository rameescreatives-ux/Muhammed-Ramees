/* =====================================================================
   UNIKAI — static site behaviour
   =====================================================================

   Plain JavaScript. No framework, no build step, no inline code — which
   matters, because strict content-security policies block inline script
   and that is what kills interactivity on a locked-down host.

   The pages are already complete HTML. This file only wires up the parts
   that need to respond to a click:

     1. Mobile menu drawer
     2. Desktop products mega menu
     3. Hero banner slider
     4. Enquiry assistant (answers from the built-in knowledge base)
     5. Fallback tile for any product image that fails to load

   Everything is found by data- attribute, so restyling or re-ordering the
   markup will not break it.
   ===================================================================== */

(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };
  var isRTL = document.documentElement.dir === "rtl";
  var isAR = (document.documentElement.lang || "en").indexOf("ar") === 0;

  /* How far this page sits below the site root. Taken from this script's
     own src ("../../site.js" → "../../"), so links the script builds work
     from any depth and under any mount point. */
  var BASE = (function () {
    var s = document.currentScript || $('script[src$="site.js"]');
    var src = s ? s.getAttribute("src") || "" : "";
    return src.replace(/site\.js$/, "");
  })();

  /* The exported markup is a snapshot of the app's first render, before
     any state existed. Controls that the framework would have enabled on
     interaction ship disabled; without it they stay that way forever. */
  function enable(el) {
    if (!el) return;
    el.disabled = false;
    el.removeAttribute("disabled");
  }

  /**
   * Move an element horizontally.
   *
   * The stylesheet positions off-canvas panels with the CSS `translate`
   * property (via a custom property), not `transform`. Setting
   * `style.transform` therefore does nothing — the panel stays off
   * screen while every other sign says it opened. Drive the same custom
   * property instead, and set `translate` directly as a fallback.
   */
  function slideX(el, value) {
    el.style.setProperty("--tw-translate-x", value);
    el.style.translate = value + " var(--tw-translate-y, 0)";
  }

  /* ---------------------------------------------------------------- 1 */
  function mobileDrawer() {
    var drawer = $("[data-drawer]");
    var openBtn = $("[data-menu-open]");
    if (!drawer || !openBtn) return;

    var panel = drawer.children[1];
    var scrim = drawer.children[0];

    function setOpen(on) {
      drawer.style.pointerEvents = on ? "auto" : "none";
      drawer.setAttribute("aria-hidden", on ? "false" : "true");
      if (scrim) scrim.style.opacity = on ? "1" : "0";
      if (panel) slideX(panel, on ? "0%" : isRTL ? "-100%" : "100%");
      document.body.style.overflow = on ? "hidden" : "";
    }

    setOpen(false);
    openBtn.addEventListener("click", function () { setOpen(true); });
    $$("[data-drawer-close]", drawer).forEach(function (el) {
      el.addEventListener("click", function () { setOpen(false); });
    });
    if (scrim) scrim.addEventListener("click", function () { setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });

    // Products accordion inside the drawer.
    //
    // The sub-list is rendered only once the accordion has been opened, so
    // it is absent from static markup entirely. The next element is the
    // following nav link — treating that as the list hides it. Build the
    // list instead, from the ranges already in the desktop mega menu.
    var toggle = $("[data-drawer-products]", drawer);
    if (toggle) {
      var list = toggle.nextElementSibling;
      if (!list || list.tagName !== "UL") {
        list = document.createElement("ul");
        list.className = "mb-2 space-y-2 border-s-2 border-ink-100 ps-4";
        $$("[data-mega-panel] a").forEach(function (a) {
          // A range link wraps an accent bar and the range name in a div;
          // the anchor's own text also carries the tagline, so read the
          // name span rather than the anchor.
          var nameEl = a.querySelector("div > span:nth-child(2)");
          if (!nameEl) return;
          var label = (nameEl.textContent || "").trim();
          if (!label) return;
          var li = document.createElement("li");
          var link = document.createElement("a");
          link.href = a.getAttribute("href");
          link.textContent = label;
          link.className = "block py-1 font-semibold text-ink-700";
          li.appendChild(link);
          list.appendChild(li);
        });
        if (!list.children.length) {
          toggle.parentNode.replaceChild(
            (function () {
              // Nothing to expand — make the row a plain link.
              var a = document.createElement("a");
              a.href = BASE + (isAR ? "ar" : "en") + "/products/index.html";
              a.className = "flex w-full items-center justify-between py-3 text-lg font-bold text-ink";
              a.textContent = (toggle.textContent || "Products").trim();
              return a;
            })(),
            toggle,
          );
          return;
        }
        toggle.insertAdjacentElement("afterend", list);
      }
      list.hidden = true;
      toggle.addEventListener("click", function () {
        list.hidden = !list.hidden;
        var chev = $("svg", toggle);
        if (chev) chev.style.transform = list.hidden ? "" : "rotate(180deg)";
      });
    }
  }

  /* ---------------------------------------------------------------- 2 */
  function megaMenu() {
    var trigger = $("[data-mega-trigger]");
    var panel = $("[data-mega-panel]");
    if (!trigger || !panel) return;

    var open = false, timer = null, openedAt = 0;

    function setOpen(on) {
      open = on;
      if (on) openedAt = Date.now();
      panel.style.maxHeight = on ? "640px" : "0px";
      panel.style.opacity = on ? "1" : "0";
      panel.style.pointerEvents = on ? "auto" : "none";
      trigger.setAttribute("aria-expanded", on ? "true" : "false");
      var chev = $("svg", trigger);
      if (chev) chev.style.transform = on ? "rotate(180deg)" : "";
    }

    function cancelClose() { if (timer) { clearTimeout(timer); timer = null; } }
    function scheduleClose() { cancelClose(); timer = setTimeout(function () { setOpen(false); }, 180); }

    setOpen(false);

    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      // On a mouse, hovering the trigger has just opened the panel, and a
      // plain toggle here would immediately close it again. Ignore the
      // click that lands straight after a hover-open.
      if (open && Date.now() - openedAt < 400) return;
      setOpen(!open);
    });

    // Hover only where hovering is real. On touch the same listeners fire
    // alongside the click and fight it.
    if (!window.matchMedia || window.matchMedia("(hover: hover)").matches) {
      trigger.addEventListener("mouseenter", function () { cancelClose(); setOpen(true); });
      trigger.addEventListener("mouseleave", scheduleClose);
    }
    panel.addEventListener("mouseenter", cancelClose);
    panel.addEventListener("mouseleave", scheduleClose);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    document.addEventListener("click", function (e) {
      if (open && !trigger.contains(e.target) && !panel.contains(e.target)) setOpen(false);
    });
  }

  /* ---------------------------------------------------------------- 3 */
  function heroSlider() {
    var hero = $("[data-hero]");
    if (!hero) return;
    var dots = $$("[data-hero-dot]", hero);
    if (dots.length < 2) return;

    // The exported HTML contains only the first slide, so the slider
    // rebuilds the others from the data the dots carry. Content for each
    // slide is read from the markup that shipped with the page.
    var copy = hero.querySelector(".anim-fade-up");
    var visual = hero.querySelector("img");
    var slides = [];
    try {
      slides = JSON.parse(hero.getAttribute("data-slides") || "[]");
    } catch (err) { slides = []; }

    var i = 0, timer = null;

    function paint(n) {
      i = (n + dots.length) % dots.length;
      dots.forEach(function (d, k) {
        var on = k === i;
        d.style.width = on ? "2.5rem" : "1rem";
        d.style.background = on ? "#fff" : "rgba(255,255,255,.35)";
        d.setAttribute("aria-current", on ? "true" : "false");
      });
      var s = slides[i];
      if (!s) return;
      var eyebrow = copy && copy.querySelector("p");
      var h1 = copy && copy.querySelector("h1");
      var body = copy && copy.querySelectorAll("p")[1];
      if (eyebrow) eyebrow.lastChild.textContent = s.eyebrow;
      if (h1) h1.textContent = s.title;
      if (body) body.textContent = s.body;
      if (visual && s.image) visual.setAttribute("src", s.image);
      var links = copy ? copy.querySelectorAll("a") : [];
      if (links[0] && s.ctaLabel) links[0].firstChild.textContent = s.ctaLabel;
      if (links[0] && s.ctaHref) links[0].setAttribute("href", s.ctaHref);
      if (copy) { copy.style.animation = "none"; void copy.offsetWidth; copy.style.animation = ""; }
    }

    function start() { stop(); timer = setInterval(function () { paint(i + 1); }, 7000); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    dots.forEach(function (d, k) {
      d.addEventListener("click", function () { paint(k); start(); });
    });
    $$("[data-hero-arrow]", hero).forEach(function (a) {
      a.addEventListener("click", function () {
        paint(i + (a.getAttribute("data-hero-arrow") === "prev" ? -1 : 1));
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);

    paint(0);
    if (slides.length > 1) start();
  }

  /* ---------------------------------------------------------------- 4 */
  function assistant() {
    var launcher = $("[data-chat-open]");
    var panel = $("[data-chat-panel]");
    if (!launcher || !panel) return;

    var kb = window.UNIKAI_KB || { passages: [], strings: {} };
    var str = (kb.strings && kb.strings[isAR ? "ar" : "en"]) || {};
    var log = panel.querySelector(".overflow-y-auto");
    var form = panel.querySelector("form");
    var input = form && form.querySelector("input");
    var submit = form && form.querySelector('button[type="submit"]');
    var open = false;

    enable(input);
    enable(submit);
    if (input) input.addEventListener("input", function () { enable(submit); });

    function setOpen(on) {
      open = on;
      panel.style.height = on ? "min(620px,80vh)" : "0px";
      panel.style.opacity = on ? "1" : "0";
      panel.style.pointerEvents = on ? "auto" : "none";
      launcher.style.transform = on ? "scale(0)" : "";
      launcher.style.opacity = on ? "0" : "1";
      launcher.setAttribute("aria-expanded", on ? "true" : "false");
      if (on && input) setTimeout(function () { input.focus(); }, 250);
    }

    function bubble(text, who, sources) {
      if (!log) return;
      var row = document.createElement("div");
      row.className = "flex " + (who === "user" ? "justify-end" : "justify-start");
      var b = document.createElement("div");
      b.className =
        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[0.875rem] leading-relaxed " +
        (who === "user"
          ? "rounded-ee-sm bg-brand-navy text-white"
          : "rounded-es-sm border border-ink-100 bg-white text-ink-700");
      b.textContent = text;
      if (sources && sources.length) {
        var wrap = document.createElement("div");
        wrap.className = "mt-2.5 flex flex-wrap gap-1.5 border-t border-ink-100 pt-2.5";
        sources.slice(0, 3).forEach(function (s) {
          var a = document.createElement("a");
          a.href = s.href;
          a.textContent = s.title;
          a.className =
            "rounded-full bg-brand-navy-50 px-2.5 py-1 text-[0.6875rem] font-semibold text-brand-navy";
          wrap.appendChild(a);
        });
        b.appendChild(wrap);
      }
      row.appendChild(b);
      log.appendChild(row);
      log.scrollTop = log.scrollHeight;
    }

    var STOP = ("the a an is are do does you your i we for to of and in on can what how me my it " +
      "with have has about please tell would like there any").split(" ");

    function answer(q) {
      var terms = q.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/)
        .filter(function (w) { return w.length > 2 && STOP.indexOf(w) === -1; });
      if (!terms.length) return null;
      var pool = kb.passages || [];
      var best = pool.map(function (p) {
        var hay = (p.title + " " + p.body).toLowerCase();
        var score = 0;
        terms.forEach(function (t) {
          (p.keywords || []).forEach(function (k) {
            if (k === t) score += 3; else if (k.indexOf(t) > -1 || t.indexOf(k) > -1) score += 1;
          });
          if (hay.indexOf(t) > -1) score += 1.5;
        });
        return { p: p, score: score };
      }).filter(function (x) { return x.score > 1; })
        .sort(function (a, b) { return b.score - a.score; })
        .slice(0, 3);
      if (!best.length) return null;
      var extra = best[1] ? " " + best[1].p.body.split(". ")[0] + "." : "";
      return {
        text: best[0].p.body + extra,
        sources: best.filter(function (x) { return x.p.href; })
          .map(function (x) {
            // Knowledge-base links are stored once, against the English
            // tree. Point them at the reader's own language, and resolve
            // them from this page's depth.
            var h = x.p.href;
            if (isAR) h = h.replace(/^en\//, "ar/");
            return { title: x.p.title, href: BASE + h };
          }),
      };
    }

    launcher.addEventListener("click", function () { setOpen(!open); });
    $$("[data-chat-close]", panel).forEach(function (el) {
      el.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && open) setOpen(false);
    });

    // Suggestion chips that shipped in the markup.
    $$("button", log || panel).forEach(function (chip) {
      if (chip.className.indexOf("rounded-full border border-ink-200") === -1) return;
      chip.addEventListener("click", function () { ask(chip.textContent.trim()); });
    });

    function ask(q) {
      if (!q) return;
      bubble(q, "user");
      var chips = log && log.querySelector(".flex.flex-wrap.gap-2.pt-1");
      if (chips) chips.remove();
      setTimeout(function () {
        var a = answer(q);
        bubble(a ? a.text : str.noAnswer, "bot", a ? a.sources : null);
      }, 420);
    }

    // The exported markup has an empty conversation: the opening line was
    // set after mount, so it is not in the HTML. Put it back.
    if (log && !log.querySelector(".justify-start")) {
      bubble(str.greeting, "bot");
    }

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var q = input ? input.value.trim() : "";
        if (input) input.value = "";
        ask(q);
      });
    }

    setOpen(false);
  }

  /* ---------------------------------------------------------------- 5 */
  function imageFallback() {
    addEventListener("error", function (e) {
      var img = e.target;
      if (!img || img.tagName !== "IMG" || img.dataset.fallback) return;
      img.dataset.fallback = "1";
      var box = document.createElement("div");
      box.textContent = img.alt || "Image pending";
      box.setAttribute("style",
        "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;" +
        "text-align:center;padding:12%;font:600 11px/1.4 ui-sans-serif,system-ui,sans-serif;" +
        "letter-spacing:.06em;text-transform:uppercase;color:#6b7280;" +
        "background:linear-gradient(160deg,#f2f2fb,#fff);border-radius:inherit");
      if (img.parentNode) img.parentNode.appendChild(box);
      img.style.visibility = "hidden";
    }, true);
  }

  function init() {
    try { imageFallback(); } catch (e) {}
    try { mobileDrawer(); } catch (e) {}
    try { megaMenu(); } catch (e) {}
    try { heroSlider(); } catch (e) {}
    try { assistant(); } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

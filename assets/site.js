/* Morris Brako, personal site
   Shared behaviour: theme, navigation, reveal, tip of the day, forms. */

(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  /* ---------- Theme ---------- */

  function setTheme(name, persist) {
    root.setAttribute('data-theme', name);
    if (persist) { try { localStorage.setItem('mb-theme', name); } catch (e) {} }
    var btn = $('.theme-toggle');
    if (btn) {
      btn.setAttribute('aria-label', name === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      btn.setAttribute('title', name === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
  }

  function initTheme() {
    var btn = $('.theme-toggle');
    setTheme(root.getAttribute('data-theme') || 'light', false);
    if (!btn) return;
    btn.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    });
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var onChange = function (e) {
        var stored = null;
        try { stored = localStorage.getItem('mb-theme'); } catch (err) {}
        if (!stored) setTheme(e.matches ? 'dark' : 'light', false);
      };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  /* ---------- Header and mobile navigation ---------- */

  function initHeader() {
    var header = $('.site-header');
    var toggle = $('.nav-toggle');
    var panel = $('.mobile-nav');

    if (header) {
      var onScroll = function () {
        header.classList.toggle('is-scrolled', window.scrollY > 8);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    if (!toggle || !panel) return;

    var open = function (yes) {
      toggle.setAttribute('aria-expanded', yes ? 'true' : 'false');
      panel.classList.toggle('is-open', yes);
      panel.hidden = !yes;
    };
    open(false);

    toggle.addEventListener('click', function () {
      open(toggle.getAttribute('aria-expanded') !== 'true');
    });

    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) open(false);
    });

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        open(false);
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) open(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */

  function initReveal() {
    var nodes = $$('.reveal');
    if (!nodes.length) return;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      nodes.forEach(function (n) { n.classList.add('is-in'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    nodes.forEach(function (n) { obs.observe(n); });
  }

  /* ---------- Animated counters ---------- */

  function initCounters() {
    var nums = $$('.stat .num[data-to]');
    if (!nums.length) return;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var run = function (el) {
      var to = parseFloat(el.getAttribute('data-to')) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduced) { el.textContent = to + suffix; return; }
      var start = null;
      var dur = 1100;
      var step = function (ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { obs.observe(n); });
  }

  /* ---------- Tip of the day ---------- */

  var TIP_EPOCH = Date.UTC(2026, 0, 1);
  var DAY = 86400000;

  function dayNumber(date) {
    return Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - TIP_EPOCH) / DAY);
  }

  function tipForDay(n, tips) {
    var i = ((n % tips.length) + tips.length) % tips.length;
    return tips[i];
  }

  function fmtDate(d) {
    try {
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return d.toISOString().slice(0, 10);
    }
  }

  function initTip() {
    var card = $('#tip-card');
    var tips = window.SITE_TIPS;
    if (!card || !tips || !tips.length) return;

    var textEl = $('#tip-text', card);
    var dateEl = $('#tip-date', card);
    var countEl = $('#tip-count', card);
    var permalink = $('#tip-permalink', card);
    var ordered = window.SITE_TIPS_ORDERED || tips;
    var prev = $('#tip-prev', card);
    var next = $('#tip-next', card);
    var offset = 0;
    var today = dayNumber(new Date());

    function render(animate) {
      var n = today + offset;
      var d = new Date(Date.now() + offset * DAY);
      var apply = function () {
        var text = tipForDay(n, tips);
        textEl.textContent = text;
        if (dateEl) dateEl.textContent = offset === 0 ? 'Today, ' + fmtDate(d) : fmtDate(d);
        var num = ordered.indexOf(text) + 1;
        if (countEl) {
          countEl.textContent = num ? 'Tip ' + num + ' of ' + ordered.length : '';
        }
        if (permalink && num) permalink.setAttribute('href', '/tips/#tip-' + num);
        if (next) next.disabled = offset >= 0;
        if (prev) prev.disabled = offset <= -30;
      };
      if (!animate) { apply(); return; }
      textEl.classList.add('is-fading');
      setTimeout(function () {
        apply();
        textEl.classList.remove('is-fading');
      }, 200);
    }

    if (prev) prev.addEventListener('click', function () { offset -= 1; render(true); });
    if (next) next.addEventListener('click', function () { if (offset < 0) { offset += 1; render(true); } });

    render(false);
  }

  function initTipArchive() {
    var list = $('#tip-archive');
    var tips = window.SITE_TIPS;
    if (!list || !tips || !tips.length) return;
    var today = dayNumber(new Date());
    var html = '';
    for (var i = 0; i < 21; i++) {
      var d = new Date(Date.now() - i * DAY);
      var label = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      html += '<li><span class="d">' + label + '</span><span class="t">' +
        escapeHtml(tipForDay(today - i, tips)) + '</span></li>';
    }
    list.innerHTML = html;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- Publication filters ---------- */

  function initFilters() {
    var bar = $('#pub-filters');
    if (!bar) return;
    var items = $$('#pub-list > li');
    bar.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      var tag = chip.getAttribute('data-filter');
      $$('.chip', bar).forEach(function (c) {
        c.setAttribute('aria-pressed', c === chip ? 'true' : 'false');
      });
      items.forEach(function (li) {
        var tags = (li.getAttribute('data-tags') || '').split(' ');
        li.classList.toggle('is-hidden', tag !== 'all' && tags.indexOf(tag) === -1);
      });
    });
  }

  /* ---------- Copy citation ---------- */

  function initCopy() {
    $$('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var text = btn.getAttribute('data-copy');
        var done = function () {
          var label = $('.lbl', btn);
          var old = label ? label.textContent : '';
          if (label) label.textContent = 'Copied';
          btn.classList.add('copied');
          setTimeout(function () {
            if (label) label.textContent = old;
            btn.classList.remove('copied');
          }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () {});
        } else {
          var ta = doc.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.left = '-9999px';
          doc.body.appendChild(ta);
          ta.select();
          try { doc.execCommand('copy'); done(); } catch (e) {}
          doc.body.removeChild(ta);
        }
      });
    });
  }

  /* ---------- Contact form ---------- */

  function initForm() {
    var form = $('#contact-form');
    if (!form) return;
    var status = $('#form-status');
    var submit = $('button[type="submit"]', form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (status) { status.className = 'form-status'; status.textContent = ''; }

      var data = new FormData(form);
      var body = new URLSearchParams();
      data.forEach(function (v, k) { body.append(k, v); });

      var original = submit ? submit.textContent : '';
      if (submit) { submit.disabled = true; submit.textContent = 'Sending'; }

      fetch(form.getAttribute('action') || '/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      }).then(function (r) {
        if (!r.ok) throw new Error('bad status');
        form.reset();
        if (status) {
          status.className = 'form-status ok';
          status.textContent = 'Thank you. Your message has been sent, and I will reply to the address you provided.';
        }
      }).catch(function () {
        if (status) {
          status.className = 'form-status err';
          status.innerHTML = 'Something went wrong sending that. Please email me directly at ' +
            '<a href="mailto:morris.brako@outlook.com">morris.brako@outlook.com</a>.';
        }
      }).then(function () {
        if (submit) { submit.disabled = false; submit.textContent = original; }
      });
    });
  }

  /* ---------- Back to top ---------- */

  function initToTop() {
    var btn = $('.to-top');
    if (!btn) return;
    var onScroll = function () {
      btn.classList.toggle('is-visible', window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    btn.addEventListener('click', function () {
      var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Legacy hash links ---------- */
  /* The first version of the site used /#read/<slug>. Keep those links working. */

  function initLegacyHash() {
    var h = location.hash.replace(/^#/, '');
    if (h.indexOf('read/') === 0) {
      var slug = h.slice(5).replace(/[^a-z0-9-]/gi, '');
      if (slug) location.replace('/insights/' + slug + '/');
    }
  }

  /* ---------- Footer year ---------- */

  function initYear() {
    $$('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  function init() {
    initLegacyHash();
    initTheme();
    initHeader();
    initReveal();
    initCounters();
    initTip();
    initTipArchive();
    initFilters();
    initCopy();
    initForm();
    initToTop();
    initYear();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
/* Cloudflare Web Analytics. Cookieless, so no consent banner is required.
   Loaded from this shared file so every page is covered, including the
   generated tips and post pages. Skipped anywhere other than the live domain,
   so local previews and Netlify deploy previews do not distort the numbers. */
(function () {
  if (location.hostname !== 'morrisbrako.com') return;
  var s = document.createElement('script');
  s.defer = true;
  s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  s.setAttribute('data-cf-beacon', '{"token": "501d2b1ee8a045ce88a3049958ad0dc1"}');
  document.head.appendChild(s);
})();

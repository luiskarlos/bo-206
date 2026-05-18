/* ===========================================================
   Apartamento 206 — Bö Escalante
   Vanilla JS for: language toggle persistence, gallery lightbox
   with per-room tab filtering, and smooth-scroll anchor preservation.
   =========================================================== */
(function () {
  'use strict';

  // ---------- Analytics helper (safe if gtag missing) ----------
  function track(eventName, params) {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params || {});
      }
    } catch (e) { /* no-op */ }
  }

  // ---------- Language toggle ----------
  document.querySelectorAll('[data-lang-link]').forEach(function (a) {
    a.addEventListener('click', function () {
      var to = a.getAttribute('data-lang-link');
      try { localStorage.setItem('lang', to); } catch (e) {}
      track('language_switch', {
        to: to,
        from: document.documentElement.lang || 'es'
      });
    });
    a.addEventListener('mousedown', function () {
      var base = a.getAttribute('href');
      a.setAttribute('href', base + (location.hash || ''));
    });
  });

  // ---------- Contact click tracking (WhatsApp / phone / email) ----------
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var channel = null;
    if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)/i.test(href)) channel = 'whatsapp';
    else if (/^tel:/i.test(href)) channel = 'phone';
    else if (/^mailto:/i.test(href)) channel = 'email';
    if (!channel) return;
    track('contact_click', {
      channel: channel,
      link_text: (a.textContent || '').trim().slice(0, 60),
      link_url: href,
      page_language: document.documentElement.lang || 'es'
    });
  });

  try {
    if (!localStorage.getItem('lang')) {
      localStorage.setItem('lang', document.documentElement.lang || 'es');
    }
  } catch (e) {}

  // ---------- Smooth-scroll ----------
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      history.pushState(null, '', id);
    });
  });

  // ---------- Gallery: room-tab filter ----------
  var galleryRoot = document.getElementById('js-gallery');
  var tabsRoot = document.getElementById('js-gallery-tabs');
  if (galleryRoot && tabsRoot) {
    var tabs = Array.prototype.slice.call(tabsRoot.querySelectorAll('.gallery-tab'));
    var allItems = Array.prototype.slice.call(galleryRoot.querySelectorAll('.gallery__item'));

    function applyFilter(room) {
      allItems.forEach(function (it, i) {
        var itemRoom = it.getAttribute('data-room');
        var visible = (room === 'all') || (itemRoom === room);
        it.hidden = !visible;
      });
      // Re-tag the "feature" element to the first visible item so the
      // big tile on desktop always lands on something visible.
      allItems.forEach(function (it) { it.classList.remove('is-feature'); });
      var firstVisible = allItems.find(function (it) { return !it.hidden; });
      if (firstVisible) firstVisible.classList.add('is-feature');
    }

    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        tabs.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');
        applyFilter(btn.getAttribute('data-room'));
      });
    });
    // Initial feature tile
    var firstVisible = allItems.find(function (it) { return !it.hidden; });
    if (firstVisible) firstVisible.classList.add('is-feature');
  }

  // ---------- Gallery lightbox ----------
  var lb = document.getElementById('js-lightbox');
  var gallery = document.getElementById('js-gallery');
  if (gallery && lb) {
    var lbImg = document.getElementById('js-lightbox-img');
    var lbSource = document.getElementById('js-lightbox-source');
    var lbCaption = document.getElementById('js-lightbox-caption');
    var btnClose = document.getElementById('js-lightbox-close');
    var btnPrev = document.getElementById('js-lightbox-prev');
    var btnNext = document.getElementById('js-lightbox-next');
    var current = 0;
    var visibleItems = [];
    var lastFocus = null;

    function refreshVisible() {
      visibleItems = Array.prototype.slice
        .call(gallery.querySelectorAll('.gallery__item'))
        .filter(function (el) { return !el.hidden; });
    }

    function show(idx) {
      if (!visibleItems.length) return;
      current = (idx + visibleItems.length) % visibleItems.length;
      var btn = visibleItems[current];
      var base = btn.getAttribute('data-img');
      var alt = btn.getAttribute('data-alt') || '';
      lbSource.setAttribute('srcset', base + '.webp');
      lbImg.setAttribute('src', base + '.jpg');
      lbImg.setAttribute('alt', alt);
      lbCaption.textContent = alt;
    }

    function open(idx) {
      refreshVisible();
      lastFocus = document.activeElement;
      show(idx);
      lb.hidden = false;
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      btnClose.focus();
      document.addEventListener('keydown', onKey);
      var btn = visibleItems[current];
      track('gallery_open', {
        image: btn ? (btn.getAttribute('data-img') || '') : '',
        room: btn ? (btn.getAttribute('data-room') || '') : '',
        page_language: document.documentElement.lang || 'es'
      });
    }

    function close() {
      lb.classList.remove('is-open');
      lb.hidden = true;
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function onKey(e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(current - 1);
      else if (e.key === 'ArrowRight') show(current + 1);
    }

    Array.prototype.slice.call(gallery.querySelectorAll('.gallery__item')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        refreshVisible();
        var idx = visibleItems.indexOf(btn);
        open(idx >= 0 ? idx : 0);
      });
    });
    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', function () { show(current - 1); });
    btnNext.addEventListener('click', function () { show(current + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });

    var startX = null;
    lb.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches.length === 1) startX = e.touches[0].clientX;
    }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : startX;
      var dx = endX - startX;
      if (Math.abs(dx) > 50) {
        if (dx < 0) show(current + 1);
        else show(current - 1);
      }
      startX = null;
    });
  }

})();

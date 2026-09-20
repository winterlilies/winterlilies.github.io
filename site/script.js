/* ============================================================
   Portfolio behaviour: theme, drawer, hash router, breadcrumb,
   lightbox, MathJax. The nav is a drawer at every width, so the header
   bar carries a breadcrumb rather than a persistent sidebar.
   ============================================================ */
(function () {
  'use strict';

  var ARTICLES = ['home', 'climate', 'proof', 'ftvt', 'rjx'];
  var DEFAULT_ARTICLE = 'home';
  var THEME_KEY = 'folio-theme';

  var root = document.documentElement;
  var body = document.body;
  var mqDark = window.matchMedia('(prefers-color-scheme: dark)');

  /* ---------------- theme ---------------- */
  var toggles = Array.prototype.slice.call(document.querySelectorAll('.theme-toggle'));

  function currentTheme() {
    return root.getAttribute('data-theme') || (mqDark.matches ? 'dark' : 'light');
  }
  function syncToggles() {
    var isDark = currentTheme() === 'dark';
    toggles.forEach(function (b) { b.setAttribute('aria-checked', isDark ? 'true' : 'false'); });
  }
  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* private mode */ }
    syncToggles();
  }
  toggles.forEach(function (b) {
    b.addEventListener('click', function () {
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  });
  function onSystemThemeChange() { if (!root.getAttribute('data-theme')) syncToggles(); }
  if (mqDark.addEventListener) mqDark.addEventListener('change', onSystemThemeChange);
  else if (mqDark.addListener) mqDark.addListener(onSystemThemeChange);
  syncToggles();

  /* ---------------- MathJax (typeset each article the first time it shows) ---- */
  function typeset(el) {
    if (!el || !window.MathJax || !window.MathJax.typesetPromise) return;
    if (el.getAttribute('data-typeset') === 'done') return;
    el.setAttribute('data-typeset', 'done');
    window.MathJax.typesetPromise([el])['catch'](function () { /* offline: leave the TeX */ });
  }
  window.__typesetActive = function () {
    typeset(document.querySelector('.article.is-active'));
  };

  /* ---------------- drawer (all widths) ---------------- */

  var content = document.getElementById('main');
  var sidebar = document.getElementById('sidebar');
  var hamburgers = Array.prototype.slice.call(document.querySelectorAll('.hamburger'));
  var navItems = Array.prototype.slice.call(document.querySelectorAll('.nav-item'));
  var drawerOpen = false;
  var preDrawerFocus = null;

  function setDrawer(open) {
    if (open === drawerOpen) return;
    drawerOpen = open;
    body.setAttribute('data-drawer', open ? 'open' : 'closed');
    hamburgers.forEach(function (b) {
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      b.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    /* keep tab order out of the page behind the drawer */
    if (content && 'inert' in HTMLElement.prototype) content.inert = open;
    if (open) {
      preDrawerFocus = document.activeElement;
      requestAnimationFrame(function () { if (sidebar && sidebar.focus) sidebar.focus(); });
    } else if (preDrawerFocus && preDrawerFocus.focus) {
      preDrawerFocus.focus();
      preDrawerFocus = null;
    }
  }
  function closeDrawer() { setDrawer(false); }

  hamburgers.forEach(function (b) {
    b.addEventListener('click', function () { setDrawer(!drawerOpen); });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-close-drawer]'), function (el) {
    el.addEventListener('click', closeDrawer);
  });

  body.setAttribute('data-drawer', 'closed');

  /* ---------------- breadcrumb ---------------- */
  /* The tail is read off the cover's own project titles, so it always says
     whatever those cards say — no second list of names to keep in sync. */
  var crumbRoot = document.querySelector('.crumb-root');
  var crumbSep = document.querySelector('.crumb-sep');
  var crumbHere = document.querySelector('.crumb-here');
  var TITLES = {};
  Array.prototype.forEach.call(document.querySelectorAll('.preview-title a[href^="#"]'), function (a) {
    TITLES[a.getAttribute('href').slice(1)] = (a.textContent || '').trim();
  });

  function setCrumb(target) {
    if (!crumbRoot) return;
    var here = (target === DEFAULT_ARTICLE) ? '' : (TITLES[target] || '');
    if (crumbHere) {
      crumbHere.textContent = here;
      crumbHere.hidden = !here;
      if (here) crumbHere.setAttribute('aria-current', 'page');
      else crumbHere.removeAttribute('aria-current');
    }
    if (crumbSep) crumbSep.hidden = !here;
    if (here) crumbRoot.removeAttribute('aria-current');
    else crumbRoot.setAttribute('aria-current', 'page');
  }

  /* ---------------- router ---------------- */
  function resetScroll() { window.scrollTo(0, 0); }

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (document.readyState !== 'complete') {
    window.addEventListener('load', function once() {
      window.removeEventListener('load', once);
      resetScroll();
    });
  }

  function hashId() {
    var h = (location.hash || '').replace(/^#/, '');
    return ARTICLES.indexOf(h) !== -1 ? h : '';
  }

  function route() {
    var target = hashId() || DEFAULT_ARTICLE;

    closeDrawer();
    /* drives the cover-vs-project chrome in CSS */
    body.setAttribute('data-page', target);
    setCrumb(target);

    ARTICLES.forEach(function (name) {
      var el = document.getElementById(name);
      if (!el) return;
      var on = (name === target);
      el.classList.toggle('is-active', on);
      if (on) typeset(el);
    });

    /* highlight the current entry in the drawer */
    navItems.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (href.charAt(0) === '#' && href.slice(1) === target) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    resetScroll();
  }

  window.addEventListener('hashchange', route);

  /* re-clicking the current target should still navigate (no hashchange fires) */
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (a) {
    a.addEventListener('click', function () {
      if (a.getAttribute('href') === location.hash) route();
    });
  });

  /* ---------------- lightbox ---------------- */
  var lb = document.getElementById('lightbox');
  var lbImg = lb.querySelector('img');
  var lbCap = lb.querySelector('.lightbox-cap');
  var lbClose = lb.querySelector('.lightbox-close');
  var lastFocus = null;

  function openLightbox(img) {
    lastFocus = document.activeElement;
    lbImg.setAttribute('src', img.currentSrc || img.src);
    lbImg.setAttribute('alt', img.getAttribute('alt') || '');
    var fig = img.closest ? img.closest('figure') : null;
    var cap = fig ? fig.querySelector('figcaption') : null;
    lbCap.textContent = cap ? cap.textContent : (img.getAttribute('alt') || '');
    lb.classList.add('is-open');
    lbClose.focus();
  }
  function closeLightbox() {
    if (!lb.classList.contains('is-open')) return;
    lb.classList.remove('is-open');
    lbImg.removeAttribute('src');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  Array.prototype.forEach.call(document.querySelectorAll('.figure > img'), function (img) {
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(img); }
    });
  });

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.matches && t.matches('.figure > img')) { openLightbox(t); return; }
    if (lb.classList.contains('is-open') && (t === lb || (t.closest && t.closest('.lightbox-close')))) {
      closeLightbox();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (lb.classList.contains('is-open')) closeLightbox();
    else closeDrawer();
  });

  /* ---------------- go ---------------- */
  route();
  if (window.__mathReady) window.__typesetActive();
})();

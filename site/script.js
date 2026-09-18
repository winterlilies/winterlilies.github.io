/* ============================================================
   Portfolio behaviour: theme, hash router, lightbox, MathJax.
   Plain ES5-ish so it runs straight off file:// with no build.
   ============================================================ */
(function () {
  'use strict';

  var ARTICLES = ['home', 'climate', 'proof', 'ftvt', 'rjx'];
  var DEFAULT_ARTICLE = 'home';
  var THEME_KEY = 'folio-theme';

  var root = document.documentElement;
  var body = document.body;
  var content = document.getElementById('main');
  var mqMobile = window.matchMedia('(max-width: 900px)');
  var mqDark = window.matchMedia('(prefers-color-scheme: dark)');

  /* ---------------- theme ---------------- */
  /* (an inline script in <head> applies the stored theme early to avoid a flash) */

  function currentTheme() {
    return root.getAttribute('data-theme') || (mqDark.matches ? 'dark' : 'light');
  }

  var toggles = Array.prototype.slice.call(document.querySelectorAll('.theme-toggle'));

  function syncToggles() {
    var isDark = currentTheme() === 'dark';
    toggles.forEach(function (btn) {
      btn.setAttribute('aria-checked', isDark ? 'true' : 'false');
    });
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* private mode */ }
    syncToggles();
  }

  toggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  });

  /* follow the OS while the visitor hasn't picked a side */
  function onSystemThemeChange() { if (!root.getAttribute('data-theme')) syncToggles(); }
  if (mqDark.addEventListener) mqDark.addEventListener('change', onSystemThemeChange);
  else if (mqDark.addListener) mqDark.addListener(onSystemThemeChange);

  syncToggles();

  /* ---------------- MathJax (typeset each article the first time it is shown) ---- */

  function typeset(el) {
    if (!el || !window.MathJax || !window.MathJax.typesetPromise) return;
    if (el.getAttribute('data-typeset') === 'done') return;
    el.setAttribute('data-typeset', 'done');
    window.MathJax.typesetPromise([el])['catch'](function () { /* offline: leave the TeX as-is */ });
  }

  window.__typesetActive = function () {
    typeset(document.querySelector('.article.is-active'));
  };

  /* ---------------- mobile drawer ---------------- */

  var sidebar = document.getElementById('sidebar');
  var hamburgers = Array.prototype.slice.call(document.querySelectorAll('.hamburger'));
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
    /* keep tab order out of the content sitting behind the drawer */
    if (content && 'inert' in HTMLElement.prototype) content.inert = open;

    if (open) {
      preDrawerFocus = document.activeElement;
      /* wait a frame: the panel is visibility:hidden until the attribute lands */
      requestAnimationFrame(function () {
        if (sidebar && sidebar.focus) sidebar.focus();
      });
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

  /* a drawer left open while resizing up to desktop would trap scroll */
  function onBreakpoint() { if (!mqMobile.matches) closeDrawer(); }
  if (mqMobile.addEventListener) mqMobile.addEventListener('change', onBreakpoint);
  else if (mqMobile.addListener) mqMobile.addListener(onBreakpoint);

  body.setAttribute('data-drawer', 'closed');

  /* ---------------- router ---------------- */

  /* The hash is a router target, not an anchor, but the browser doesn't know that:
     on a fresh load of `index.html#climate` it scrolls that element to the top of
     the viewport, which on mobile tucks the article header under the sticky bar.
     route() runs while the document is still parsing, so its reset happens before
     that scroll — hence a second, one-shot reset once loading is done. */
  function resetScroll() {
    if (content) content.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  if (document.readyState !== 'complete') {
    window.addEventListener('load', function once() {
      window.removeEventListener('load', once);
      resetScroll();
    });
  }

  var navItems = Array.prototype.slice.call(document.querySelectorAll('.nav-item'));

  function hashId() {
    var h = (location.hash || '').replace(/^#/, '');
    return ARTICLES.indexOf(h) !== -1 ? h : '';
  }

  function route() {
    var target = hashId() || DEFAULT_ARTICLE;

    closeDrawer();

    ARTICLES.forEach(function (name) {
      var el = document.getElementById(name);
      if (!el) return;
      var on = (name === target);
      el.classList.toggle('is-active', on);
      if (on) typeset(el);
    });

    navItems.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var isMatch = href.charAt(0) === '#' && href.slice(1) === target;
      if (isMatch) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    resetScroll();
  }

  window.addEventListener('hashchange', route);

  /* re-clicking the active item should still navigate (no hashchange fires) */
  navItems.forEach(function (link) {
    link.addEventListener('click', function () {
      var href = link.getAttribute('href') || '';
      if (href.charAt(0) === '#' && href === location.hash) route();
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

  /* make figure images behave like buttons */
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

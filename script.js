(function () {
  var root = document.documentElement;
  root.classList.add('js');

  /* header shadow on scroll */
  var header = document.querySelector('.site-header');
  var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobile menu */
  var menuBtn = document.getElementById('menuBtn');
  var nav = document.getElementById('nav');
  var setMenu = function (open) {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
  };
  menuBtn.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* before / after slider */
  var ba = document.getElementById('ba');
  var range = document.getElementById('baRange');
  var imgBefore = document.getElementById('baBefore');
  var imgAfter = document.getElementById('baAfter');
  var setPos = function (v) { ba.style.setProperty('--pos', v + '%'); };
  range.addEventListener('input', function () { setPos(range.value); });

  /* drag anywhere on the photo: the line follows the finger/cursor exactly */
  var dragging = false;
  var fromPointer = function (e) {
    var r = ba.getBoundingClientRect();
    var v = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
    v = Math.round(v * 10) / 10;
    range.value = v; setPos(v);
  };
  ba.addEventListener('pointerdown', function (e) {
    if (e.button && e.button !== 0) return;
    dragging = true; ba.classList.add('is-dragging');
    if (ba.setPointerCapture) { try { ba.setPointerCapture(e.pointerId); } catch (err) {} }
    fromPointer(e);
  });
  ba.addEventListener('pointermove', function (e) { if (dragging) fromPointer(e); });
  var stopDrag = function () { dragging = false; ba.classList.remove('is-dragging'); };
  ba.addEventListener('pointerup', stopDrag);
  ba.addEventListener('pointercancel', stopDrag);
  ba.addEventListener('lostpointercapture', stopDrag);

  var baTabs = Array.prototype.slice.call(document.querySelectorAll('.ba-tab'));
  baTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      if (tab.classList.contains('is-active')) return;
      baTabs.forEach(function (t) { t.classList.remove('is-active'); t.setAttribute('aria-pressed', 'false'); });
      tab.classList.add('is-active');
      tab.setAttribute('aria-pressed', 'true');
      var label = tab.getAttribute('data-label');
      [imgBefore, imgAfter].forEach(function (im) { im.classList.add('is-swapping'); });
      var pre = new Image();
      pre.onload = pre.onerror = function () {
        imgBefore.src = tab.getAttribute('data-before');
        imgAfter.src = tab.getAttribute('data-after');
        imgBefore.alt = label + ' до прибирання';
        imgAfter.alt = label + ' після прибирання';
        range.value = 50; setPos(50);
        setTimeout(function () { [imgBefore, imgAfter].forEach(function (im) { im.classList.remove('is-swapping'); }); }, 40);
      };
      pre.src = tab.getAttribute('data-after');
    });
  });

  /* included tabs */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var activate = function (name, focus) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-tab') === name;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      panel.classList.toggle('is-active', on);
      if (on && focus) t.focus();
    });
  };
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { activate(t.getAttribute('data-tab')); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var next = tabs[(i + d + tabs.length) % tabs.length];
      activate(next.getAttribute('data-tab'), true);
    });
  });
  document.querySelectorAll('[data-tab]').forEach(function (a) {
    if (a.classList.contains('tab')) return;
    a.addEventListener('click', function () { activate(a.getAttribute('data-tab')); });
  });

  /* reveal on scroll */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* mobile call bar: hide it while the hero call buttons are still on screen */
  var callbar = document.querySelector('.callbar');
  var heroActions = document.querySelector('.hero-actions');
  if (callbar && heroActions && 'IntersectionObserver' in window) {
    callbar.classList.add('is-hidden');
    new IntersectionObserver(function (entries) {
      callbar.classList.toggle('is-hidden', entries[0].isIntersecting);
    }, { threshold: 0 }).observe(heroActions);
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

(function () {
  var root = document.documentElement;
  root.classList.add('js');

  /* language: ?lang=ko|zh > saved choice > default zh */
  var langBtns = document.querySelectorAll('[data-set-lang]');
  function setLang(l, save) {
    l = l === 'ko' ? 'ko' : 'zh';
    root.setAttribute('data-lang', l);
    root.setAttribute('lang', l === 'ko' ? 'ko' : 'zh-Hant');
    langBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-set-lang') === l ? 'true' : 'false'); });
    document.title = l === 'ko' ? '我們家教會 (아문가 교회) · 대만 타이중' : '我們家教會 Our Family Church · 台中';
    if (save) { try { localStorage.setItem('church-lang', l); } catch (e) {} }
  }
  var q = (location.search.match(/[?&]lang=(ko|zh)/) || [])[1], saved = null;
  try { saved = localStorage.getItem('church-lang'); } catch (e) {}
  setLang(q || saved || 'zh', false);
  langBtns.forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-set-lang'), true); }); });

  /* theme: follows system, button overrides (saved in this browser only) */
  var tbtn = document.getElementById('themeBtn'), icon = document.getElementById('themeIcon');
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function cur() { return root.getAttribute('data-theme') || (mq && mq.matches ? 'dark' : 'light'); }
  function paint() { icon.setAttribute('href', cur() === 'dark' ? '#i-sun' : '#i-moon'); }
  try { var t = localStorage.getItem('church-theme'); if (t === 'dark' || t === 'light') root.setAttribute('data-theme', t); } catch (e) {}
  paint();
  if (mq && mq.addEventListener) mq.addEventListener('change', paint);
  tbtn.addEventListener('click', function () {
    var n = cur() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', n);
    try { localStorage.setItem('church-theme', n); } catch (e) {}
    paint();
  });

  /* mobile menu */
  var mm = document.getElementById('mmenu');
  mm.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { mm.open = false; }); });
  var panel = mm.querySelector('.mmenu-panel');
  panel.addEventListener('click', function (e) { if (e.target === panel && e.offsetY > panel.clientHeight) mm.open = false; });
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.key === 'Esc') && mm.open) { mm.open = false; mm.querySelector('summary').focus(); }
  });

  /* YouTube: load the player only when the visitor presses play */
  document.querySelectorAll('.yt[data-id]').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + b.getAttribute('data-id') + '?autoplay=1&rel=0';
      f.title = b.getAttribute('aria-label') || 'YouTube';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      b.replaceChildren(f);
      b.removeAttribute('data-id');
    }, { once: true });
  });

  /* slideshows: <div class="show" data-imgs="a.jpg,b.jpg"> — first image eager, rest lazy */
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.show[data-imgs]').forEach(function (box) {
    var list = box.getAttribute('data-imgs').split(','), alt = box.getAttribute('data-alt') || '';
    var imgs = list.map(function (src, i) {
      var im = document.createElement('img');
      im.alt = i === 0 ? alt : ''; im.decoding = 'async'; if (i > 0) im.loading = 'lazy';
      im.src = 'assets/img/' + src.trim() + '.jpg';
      box.appendChild(im); return im;
    });
    var ui = document.createElement('div'); ui.className = 'show-ui';
    ui.innerHTML = '<button type="button" aria-label="previous">‹</button><button type="button" aria-label="next">›</button><span class="cnt"></span>';
    box.appendChild(ui);
    var cnt = ui.querySelector('.cnt'), cur = 0, timer = null;
    function go(n) { imgs[cur].classList.remove('on'); cur = (n + imgs.length) % imgs.length; imgs[cur].classList.add('on'); cnt.textContent = (cur + 1) + ' / ' + imgs.length; }
    function play() { if (still || imgs.length < 2) return; stop(); timer = setInterval(function () { go(cur + 1); }, +(box.getAttribute('data-ms') || 4000)); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    ui.children[0].addEventListener('click', function () { go(cur - 1); play(); });
    ui.children[1].addEventListener('click', function () { go(cur + 1); play(); });
    var sx = null, sy = null;
    box.addEventListener('touchstart', function (e) { var t = e.touches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (sx === null) return; var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy; sx = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) { go(cur + (dx < 0 ? 1 : -1)); play(); }
    }, { passive: true });
    box.style.touchAction = 'pan-y pinch-zoom';
    go(0); play();
  });

  /* phones: long stacks become sideways swipe rows (like the side-by-side layout on a computer) */
  (function () {
    function wrapRun(parent, sel, extra) {
      var kids = Array.prototype.filter.call(parent.children, function (c) { return c.matches(sel); });
      if (kids.length < 2) return;
      var box = document.createElement('div'); box.className = 'swipe ' + (extra || '');
      kids[0].parentNode.insertBefore(box, kids[0]);
      kids.forEach(function (k) { box.appendChild(k); });
    }
    var mw = document.querySelector('#ministry .wrap'); if (mw) wrapRun(mw, 'article.min', 'big');
    var gw = document.querySelector('#gallery .wrap'); if (gw) wrapRun(gw, '.gal', 'big');
    var ow = document.querySelector('#outreach .wrap'); if (ow) wrapRun(ow, '.min, .qwrap', 'big');
    var pw = document.querySelector('#pastor .wrap'); if (pw) wrapRun(pw, '.pastor, .leaders-wrap', 'big');
    [['.years', 'mid'], ['#events .events', 'sm'], ['#events .ev-list', 'mid'], ['#videos .videos', 'mid'], ['.week-grid', 'sm'], ['#bulletins .bl', 'mid'], ['#vision .visions', 'mid'], ['#prayer .prayers', 'mid']].forEach(function (x) {
      document.querySelectorAll(x[0]).forEach(function (el) { el.classList.add('swipe', x[1]); });
    });
    document.querySelectorAll('.swipe').forEach(function (row) {
      var n = row.children.length; if (n < 2) return;
      var hint = document.createElement('div'); hint.className = 'swipe-hint'; hint.setAttribute('aria-hidden', 'true');
      hint.innerHTML = '<span class="zh">← 左右滑動看更多 →</span><span class="ko">← 옆으로 밀어서 더 보기 →</span>';
      row.parentNode.insertBefore(hint, row);
      var dots = document.createElement('div'); dots.className = 'swipe-dots';
      for (var i = 0; i < n; i++) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'dot'; b.setAttribute('aria-label', (i + 1) + ' / ' + n);
        (function (i) { b.addEventListener('click', function () { row.scrollTo({ left: row.children[i].offsetLeft - row.offsetLeft - parseFloat(getComputedStyle(row).paddingLeft || 0), behavior: 'smooth' }); }); })(i);
        dots.appendChild(b);
      }
      var prev = document.createElement('button'); prev.type = 'button'; prev.className = 'swipe-arrow'; prev.textContent = '‹'; prev.setAttribute('aria-label', 'previous');
      var next = document.createElement('button'); next.type = 'button'; next.className = 'swipe-arrow'; next.textContent = '›'; next.setAttribute('aria-label', 'next');
      function step(d) { var ds = dots.querySelectorAll('.dot'); var cur = Array.prototype.findIndex.call(ds, function (x) { return x.classList.contains('on'); }); ds[Math.max(0, Math.min(n - 1, cur + d))].click(); }
      prev.addEventListener('click', function () { step(-1); }); next.addEventListener('click', function () { step(1); });
      dots.insertBefore(prev, dots.firstChild); dots.appendChild(next);
      row.parentNode.insertBefore(dots, row.nextSibling);
      function mark() {
        var x = row.scrollLeft, best = 0, bd = 1e9;
        for (var i = 0; i < n; i++) { var d = Math.abs(row.children[i].offsetLeft - row.offsetLeft - x - parseFloat(getComputedStyle(row).paddingLeft || 0)); if (d < bd) { bd = d; best = i; } }
        if (row.scrollLeft + row.clientWidth >= row.scrollWidth - 4) best = n - 1;
        Array.prototype.forEach.call(dots.querySelectorAll('.dot'), function (b, i) { b.classList.toggle('on', i === best); });
      }
      row.addEventListener('scroll', function () { window.requestAnimationFrame(mark); }, { passive: true });
      mark();
    });
  })();

  /* phones: swipe sideways anywhere on the page → jump to the next / previous section */
  (function () {
    if (!window.matchMedia || !window.matchMedia('(max-width:759px)').matches) return;
    var secs = Array.prototype.slice.call(document.querySelectorAll('main > section'));
    var bd = document.body.dataset, paged = !!bd.page;
    if (!paged && secs.length < 2) return;
    var toast = document.createElement('div'); toast.className = 'sec-toast'; document.body.appendChild(toast);
    var tt = null;
    function name(sec) { var h = sec.querySelector('h1, h2'); if (!h) return ''; var c = h.cloneNode(true);
      c.querySelectorAll(root.getAttribute('data-lang') === 'ko' ? '.zh' : '.ko').forEach(function (x) { x.remove(); });
      return c.textContent.replace(/\s+/g, ' ').trim().slice(0, 24); }
    function curIndex() { var y = window.scrollY + 120, k = 0; secs.forEach(function (s, i) { if (s.getBoundingClientRect().top + window.scrollY <= y) k = i; }); return k; }
    function go(d) {
      if (paged) { var u = d > 0 ? bd.next : bd.prev; if (u) { toast.textContent = d > 0 ? '→' : '←'; toast.classList.add('on'); location.href = u; } return; }
      var i = Math.max(0, Math.min(secs.length - 1, curIndex() + d)), sec = secs[i];
      window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' });
      toast.textContent = (d > 0 ? '→ ' : '← ') + (i + 1) + ' / ' + secs.length + '  ' + name(sec);
      toast.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('on'); }, 1400);
    }
    var sx = null, sy = null, lx = 0, ly = 0, st = 0;
    document.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1 || e.target.closest('.swipe, .show, video, iframe, input, textarea, select, .mmenu-panel, .yrs, .qchart, .sec-nav')) { sx = null; return; }
      sx = lx = e.touches[0].clientX; sy = ly = e.touches[0].clientY; st = Date.now();
    }, { passive: true });
    document.addEventListener('touchmove', function (e) { if (sx !== null && e.touches.length === 1) { lx = e.touches[0].clientX; ly = e.touches[0].clientY; } else sx = null; }, { passive: true });
    function finish(e) {
      if (sx === null) return; var t = e.changedTouches && e.changedTouches[0];
      var ex = t ? t.clientX : lx, ey = t ? t.clientY : ly; if (e.type === 'touchcancel') { ex = lx; ey = ly; }
      var dx = ex - sx, dy = ey - sy; sx = null;
      if (Date.now() - st > 900 || (window.visualViewport && window.visualViewport.scale > 1.05)) return;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
    }
    document.addEventListener('touchend', finish, { passive: true });
    document.addEventListener('touchcancel', finish, { passive: true });
    /* always-visible buttons too (work even if the phone's browser keeps the sideways gesture for itself) */
    var nav = document.createElement('div'); nav.className = 'sec-nav';
    nav.innerHTML = '<button type="button" aria-label="previous section">‹</button><button type="button" aria-label="next section">›</button>';
    nav.children[0].addEventListener('click', function () { go(-1); }); nav.children[1].addEventListener('click', function () { go(1); });
    document.body.appendChild(nav);
    /* 가− / 가+ : make the whole page smaller or bigger (saved on this phone) */
    var Z = [0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3], zi = 4;
    try { var zs = parseFloat(localStorage.getItem('church-zoom')); if (Z.indexOf(zs) >= 0) zi = Z.indexOf(zs); } catch (e) {}
    var zbox = document.createElement('div'); zbox.className = 'zoom-nav';
    zbox.innerHTML = '<button type="button" aria-label="smaller"><span class="zh">A−</span><span class="ko">가−</span></button><span hidden></span><button type="button" aria-label="bigger"><span class="zh">A+</span><span class="ko">가+</span></button>';
    function applyZ() {
      document.querySelectorAll('body > main, body > footer').forEach(function (el) { el.style.zoom = Z[zi] === 1 ? '' : String(Z[zi]); });
      zbox.children[1].textContent = Math.round(Z[zi] * 100) + '%';
      try { localStorage.setItem('church-zoom', String(Z[zi])); } catch (e) {}
    }
    zbox.children[0].addEventListener('click', function () { var y = window.scrollY / document.documentElement.scrollHeight; if (zi > 0) { zi--; applyZ(); window.scrollTo(0, y * document.documentElement.scrollHeight); } });
    zbox.children[2].addEventListener('click', function () { var y = window.scrollY / document.documentElement.scrollHeight; if (zi < Z.length - 1) { zi++; applyZ(); window.scrollTo(0, y * document.documentElement.scrollHeight); } });
    var lang = document.querySelector('.bar .lang'); lang.parentNode.insertBefore(zbox, lang.nextSibling); applyZ();
    function flash() { toast.textContent = Math.round(Z[zi] * 100) + '%'; toast.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('on'); }, 900); }
    zbox.children[0].addEventListener('click', flash); zbox.children[2].addEventListener('click', flash);
  })();

  /* scroll reveal */
  var items = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window)) { items.forEach(function (el) { el.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0.01 });
  items.forEach(function (el) { io.observe(el); });
})();

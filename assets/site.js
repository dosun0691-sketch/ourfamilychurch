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
    function play() { if (imgs.length < 2) return; stop(); timer = setInterval(function () { go(cur + 1); }, +(box.getAttribute('data-ms') || 4000)); }
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
      if (e.touches.length !== 1 || e.target.closest('.jb, .swipe, .show, video, iframe, input, textarea, select, .mmenu-panel, .yrs, .qchart, .sec-nav')) { sx = null; return; }
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

  /* auto-update: if the page in this phone's cache is older than the site, reload once */
  (function () {
    var mine = (document.querySelector('script[src*="site.js?v="]') || {}).src || '';
    mine = (mine.match(/v=([0-9a-z]+)/) || [])[1]; if (!mine || !window.fetch) return;
    fetch('version.json?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j || !j.v || j.v === mine) return;
      var k = 'church-upd-' + j.v; try { if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, '1'); } catch (e) {}
      var u = location.pathname + '?u=' + j.v + location.hash; location.replace(u);
    }).catch(function () {});
  })();

  /* after a site update, refresh this phone's saved copies of the other pages once */
  (function () {
    var v = ((document.querySelector('script[src*="site.js?v="]') || {}).src || '').split('v=')[1];
    if (!v || !window.fetch) return;
    try { if (localStorage.getItem('church-ver') === v) return; } catch (e) { return; }
    var pages = ['index', 'pastor', 'worship', 'prayermeet', 'vision', 'ministry', 'outreach', 'events', 'gallery', 'videos', 'prayer', 'visit'];
    setTimeout(function () {
      Promise.all(pages.map(function (n) { return fetch(n + '.html', { cache: 'reload' }).catch(function () {}); }))
        .then(function () { try { localStorage.setItem('church-ver', v); } catch (e) {} });
    }, 1500);
  })();

  /* scroll reveal */
  var items = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window)) { items.forEach(function (el) { el.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0.01 });
  items.forEach(function (el) { io.observe(el); });
})();

/* 週報 viewer (#jb): year → Sunday list → one bulletin page at a time, like jubo.jjc.or.kr (owner order 2026-11-16) */
(function () {
  var dataEl = document.getElementById('jb-data'), box = document.getElementById('jb');
  if (!dataEl || !box) return;
  var D = JSON.parse(dataEl.textContent), root = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };
  var ySel = $('jb-year'), q = $('jb-q'), pick = $('jb-pick'), list = $('jb-list'), paper = $('jb-paper'), title = $('jb-title'), dots = $('jb-dots');
  var years = Object.keys(D.years).sort().reverse();
  var ko = function () { return root.getAttribute('data-lang') === 'ko'; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var bi = function (z, k) { return '<span class="zh">' + z + '</span><span class="ko">' + k + '</span>'; };
  var md = function (d) { var p = d.split('-'); return (+p[1]) + '/' + (+p[2]); };
  var reEsc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
  var idx = 0, zoom = 100, items = [];
  try { zoom = +localStorage.getItem('jb-zoom') || 100; } catch (e) {}

  function build(y) { items = [{ cover: true, y: y }].concat(D.years[y]); }  // page 1 = year overview, then Sundays newest first
  function nums(b, avg) {
    var out = [], a = avg ? bi(' 平均', ' 평균') : '', pr = avg ? b : (b.pr || {});
    if (b.am != null) out.push('<span class="bl-n am">' + bi('主日出席', '주일출석') + a + ' <b>' + b.am + '</b>' + bi('人', '명') + '</span>');
    if (b.pm != null) out.push('<span class="bl-n pm">' + bi('下午活動', '오후활동') + a + ' <b>' + b.pm + '</b>' + bi('人', '명') + '</span>');
    [['fri', '週五禱告會', '금요기도회'], ['tue', '週二晨禱', '화요 새벽기도'], ['late', '深夜禱告會', '심야 기도회']].forEach(function (x) {
      if (pr[x[0]] != null) out.push('<span class="bl-n pr">' + bi(x[1], x[2]) + a + ' <b>' + pr[x[0]] + '</b>' + bi('人', '명') + '</span>');
    });
    return out.join('');
  }
  function head(sub, date) {
    return '<div class="jb-head"><div class="jb-mast"><img src="assets/img/logo-256.png" alt="" width="44" height="44"><div><b>我們家教會' +
      '</b><small>' + bi('週報', '주보') + ' · OUR FAMILY CHURCH</small></div></div><div class="jb-date">' + date + '<small>' + sub + '</small></div></div>';
  }
  function setHash(h) { try { history.replaceState(null, '', '#' + h); } catch (e) {} }
  function render() {
    var it = items[idx], n = items.length;
    if (it.cover) {
      var h = D.hl[it.y], av = D.avg[it.y] || {}, c = D.years[it.y].length;
      paper.innerHTML = head(bi(c + ' 個主日', '주일 ' + c + '회'), it.y) +
        '<h3 class="jb-h">' + bi(it.y + '年 · 一年的恩典', it.y + '년 · 한 해의 은혜') + '</h3>' +
        '<div class="jb-nums">' + nums(av, true) + '</div>' +
        (h ? '<ul class="jb-hl">' + h.zh.map(function (z, i) { return '<li>' + bi(esc(z), esc(h.ko[i] || '')) + '</li>'; }).join('') + '</ul>' : '') +
        '<p class="jb-tip">' + bi('按 → 或左右滑動，看每個主日的週報', '→ 를 누르거나 옆으로 밀면 주일별 주보를 볼 수 있어요') + '</p>';
      title.innerHTML = bi(it.y + '年 週報', it.y + '년 주보') + ' <small>(' + (idx + 1) + '/' + n + ')</small>';
      setHash(it.y);
    } else {
      var p = it.d.split('-');
      paper.innerHTML = head(bi(esc(it.kz), esc(it.kk)), p[0] + '. ' + (+p[1]) + '. ' + (+p[2])) +
        '<div class="jb-nums">' + nums(it) + '</div>' +
        '<h3 class="jb-h">' + bi('教會消息', '교회 소식') + '</h3>' +
        (it.az.length ? '<ol class="jb-ann">' + it.az.map(function (z, i) { return '<li>' + bi(esc(z), esc(it.ak[i] || '')) + '</li>'; }).join('') + '</ol>'
          : '<p class="jb-none">' + bi('這週沒有留下消息紀錄。', '이 주의 소식은 기록되어 있지 않아요.') + '</p>') +
        '<div class="jb-foot">' + bi('台中 我們家教會', '타이중 · 我們家教會') + '</div>';
      title.innerHTML = bi(md(it.d) + ' 週報', md(it.d) + ' 주보') + ' <small>(' + (idx + 1) + '/' + n + ')</small>';
      setHash(it.d);
    }
    $('jb-prev').disabled = idx === 0; $('jb-next').disabled = idx === n - 1;
    var searching = !!q.value.trim();
    if (!searching) {
      Array.prototype.forEach.call(list.children, function (li, i) { li.classList.toggle('on', i === idx); });
      var on = list.children[idx];
      if (on && list.clientHeight) { var r1 = list.getBoundingClientRect(), r2 = on.getBoundingClientRect();
        if (r2.top < r1.top || r2.bottom > r1.bottom) list.scrollTop += r2.top - r1.top - 80; }
    }
    pick.selectedIndex = idx;
    dots.innerHTML = '';
    var s = Math.max(0, Math.min(n - 5, idx - 2));
    for (var i = s; i < Math.min(n, s + 5); i++) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = i + 1; if (i === idx) b.className = 'on';
      b.onclick = (function (k) { return function () { go(k); }; })(i); dots.appendChild(b);
    }
    paper.style.fontSize = zoom + '%'; $('jb-zval').textContent = zoom + '%';
  }
  function go(k) { idx = Math.max(0, Math.min(items.length - 1, k)); render(); }
  function label(it) { return it.cover ? bi(it.y + '年 一年總覽', it.y + '년 한 해 요약') : '<b>' + md(it.d) + '</b> ' + bi(esc(it.kz), esc(it.kk)); }
  function fillList() {
    list.innerHTML = items.map(function (it, i) { return '<li><button type="button" data-i="' + i + '">' + label(it) + '</button></li>'; }).join('');
    pick.innerHTML = items.map(function (it, i) {
      return '<option value="' + i + '">' + esc(it.cover ? it.y + (ko() ? '년 한 해 요약' : '年 一年總覽') : md(it.d) + ' · ' + (ko() ? it.kk : it.kz)) + '</option>'; }).join('');
  }
  function setYear(y, k) { ySel.value = y; build(y); fillList(); go(k || 0); }
  function search() {
    var t = q.value.trim();
    if (!t) { fillList(); render(); return; }
    var tl = t.toLowerCase(), hits = [];
    years.forEach(function (y) { D.years[y].forEach(function (b) {
      var all = b.az.concat(b.ak).join(' '), at = all.toLowerCase().indexOf(tl);
      if (at >= 0 || b.d.indexOf(t) >= 0) hits.push({ y: y, b: b, s: at >= 0 ? all.slice(Math.max(0, at - 14), at + 40) : '' });
    }); });
    var re = new RegExp(reEsc(esc(t)), 'ig');
    list.innerHTML = '<li class="jb-cnt">' + bi(hits.length + ' 筆', hits.length + '건') + '</li>' + hits.slice(0, 200).map(function (h) {
      var s = esc(h.s).replace(re, function (m) { return '<mark>' + m + '</mark>'; });
      return '<li><button type="button" data-d="' + h.b.d + '"><b>' + h.y + '. ' + md(h.b.d) + '</b>' + (s ? '<small>…' + s + '…</small>' : '') + '</button></li>'; }).join('');
  }
  list.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.d) {
      var y = b.dataset.d.slice(0, 4), k = 0; ySel.value = y; build(y);
      items.forEach(function (it, i) { if (it.d === b.dataset.d) k = i; });
      pick.innerHTML = ''; fillPickOnly(); go(k);
      if (window.innerWidth < 760) paper.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    go(+b.dataset.i);
  });
  function fillPickOnly() {
    pick.innerHTML = items.map(function (it, i) {
      return '<option value="' + i + '">' + esc(it.cover ? it.y + (ko() ? '년 한 해 요약' : '年 一年總覽') : md(it.d) + ' · ' + (ko() ? it.kk : it.kz)) + '</option>'; }).join('');
  }
  ySel.innerHTML = years.map(function (y) { return '<option value="' + y + '">' + y + '</option>'; }).join('');
  ySel.onchange = function () { q.value = ''; setYear(ySel.value); };
  pick.onchange = function () { go(+pick.value); };
  q.addEventListener('input', search);
  $('jb-prev').onclick = function () { go(idx - 1); };
  $('jb-next').onclick = function () { go(idx + 1); };
  function z(d) { zoom = Math.max(70, Math.min(200, zoom + d)); try { localStorage.setItem('jb-zoom', zoom); } catch (e) {} render(); }
  $('jb-zin').onclick = function () { z(10); }; $('jb-zout').onclick = function () { z(-10); };
  box.addEventListener('keydown', function (e) {
    if (e.target === q || e.target.tagName === 'SELECT') return;
    if (e.key === 'ArrowLeft') go(idx - 1); if (e.key === 'ArrowRight') go(idx + 1);
  });
  var sx = null, sy = null;
  paper.addEventListener('touchstart', function (e) { if (e.touches.length === 1) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; } else sx = null; }, { passive: true });
  paper.addEventListener('touchend', function (e) {
    if (sx == null) return; var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy; sx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(idx + (dx < 0 ? 1 : -1));
  }, { passive: true });
  function langChanged() {
    q.placeholder = ko() ? '주보 내용 검색' : '搜尋週報內容';
    if (q.value.trim()) { fillPickOnly(); search(); } else fillList();
    render();
  }
  new MutationObserver(langChanged).observe(root, { attributes: true, attributeFilter: ['data-lang'] });
  var hsh = decodeURIComponent(location.hash.slice(1)), m = hsh.match(/^(\d{4})(-\d\d-\d\d)?$/), k0 = 1, y0 = years[0];
  if (m && D.years[m[1]]) { y0 = m[1]; k0 = 0; build(y0); if (m[2]) items.forEach(function (it, i) { if (it.d === hsh) k0 = i; }); }
  q.placeholder = ko() ? '주보 내용 검색' : '搜尋週報內容';
  setYear(y0, k0);
})();

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
    go(0); play();
  });

  /* scroll reveal */
  var items = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window)) { items.forEach(function (el) { el.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0.01 });
  items.forEach(function (el) { io.observe(el); });
})();

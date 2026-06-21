// モバイルメニューの開閉
(function () {
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  if (!toggle || !nav) return;

  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // メニュー内リンクをタップしたら閉じる
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });
})();

// スクロールでヘッダーの透過/不透明を切り替え
(function () {
  var header = document.querySelector('.header');
  if (!header) return;

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// スクロール時に要素をふわっと表示
(function () {
  document.documentElement.classList.add('js-enabled');

  var targets = [
    '.band',
    '.news__head',
    '.news__item',
    '.section__head',
    '.card',
    '.reason',
    '.flow__step',
    '.plan',
    '.plans__note',
    '.about__body',
    '.about__info',
    '.office-gallery',
    '.greeting__person',
    '.greeting__body',
    '.cta__inner',
    '.article h2',
    '.article h3',
    '.article p:not(.article__lead)',
    '.article__list li'
  ].join(',');

  var elements = Array.prototype.slice.call(document.querySelectorAll(targets));
  if (!elements.length) return;

  elements.forEach(function (el) {
    el.classList.add('js-reveal');
  });

  document.querySelectorAll('.about__body,.greeting__person').forEach(function (el) {
    el.setAttribute('data-reveal', 'left');
  });
  document.querySelectorAll('.about__info,.greeting__body').forEach(function (el) {
    el.setAttribute('data-reveal', 'right');
  });
  document.querySelectorAll('.card,.plan,.reason,.flow__step').forEach(function (el) {
    el.setAttribute('data-reveal', 'scale');
  });

  if (!('IntersectionObserver' in window)) {
    elements.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px'
  });

  elements.forEach(function (el) { observer.observe(el); });
})();

// セクション上部の波線：画面に入った時だけ波打ち、最後は静止状態で止める
(function () {
  var sections = Array.prototype.slice.call(document.querySelectorAll('.section'));
  if (!sections.length) return;

  if (!('IntersectionObserver' in window)) {
    sections.forEach(function (section) { section.classList.add('wave-play'); });
    return;
  }

  var waveObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('wave-play');
        waveObserver.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.28,
    rootMargin: '0px 0px -18% 0px'
  });

  sections.forEach(function (section) { waveObserver.observe(section); });
})();

// 再修正：セクション上部の波線を、画面表示時だけ「実際に波形変形」させて止める
(function () {
  var sections = Array.prototype.slice.call(document.querySelectorAll('.section'));
  if (!sections.length) return;

  var baseAmp = 24;
  var width = 1440;
  var height = 86;

  function makePath(t, amp, phase) {
    var points = [];
    var step = 60;
    for (var x = 0; x <= width; x += step) {
      var y = 43
        + Math.sin((x / width) * Math.PI * 2.25 + phase) * amp
        + Math.sin((x / width) * Math.PI * 5.2 + phase * 0.62) * amp * 0.32;
      points.push([x, y]);
    }
    var d = 'M' + points[0][0] + ',' + points[0][1].toFixed(2);
    for (var i = 1; i < points.length; i++) {
      var p0 = points[i - 1];
      var p1 = points[i];
      var cx = (p0[0] + p1[0]) / 2;
      d += ' C' + cx + ',' + p0[1].toFixed(2) + ' ' + cx + ',' + p1[1].toFixed(2) + ' ' + p1[0] + ',' + p1[1].toFixed(2);
    }
    return d;
  }

  function makeSvg(index) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'section-wave');
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');

    var defs = document.createElementNS(ns, 'defs');
    var grad = document.createElementNS(ns, 'linearGradient');
    var gradId = 'sectionWaveGradient-' + index;
    grad.setAttribute('id', gradId);
    grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%');
    grad.setAttribute('x2', '100%'); grad.setAttribute('y2', '0%');
    [['0%','#0fb486'],['55%','#42d392'],['100%','#9be15d']].forEach(function (s) {
      var stop = document.createElementNS(ns, 'stop');
      stop.setAttribute('offset', s[0]);
      stop.setAttribute('stop-color', s[1]);
      grad.appendChild(stop);
    });
    defs.appendChild(grad);
    svg.appendChild(defs);

    var soft = document.createElementNS(ns, 'path');
    soft.setAttribute('class', 'section-wave__path--soft');
    soft.setAttribute('transform', 'translate(0 10)');

    var path = document.createElementNS(ns, 'path');
    path.setAttribute('class', 'section-wave__path');
    path.setAttribute('stroke', 'url(#' + gradId + ')');

    var finalD = makePath(0, 12, 0.55);
    soft.setAttribute('d', makePath(0, 10, 1.35));
    path.setAttribute('d', finalD);
    svg.appendChild(soft);
    svg.appendChild(path);

    return { svg: svg, path: path, soft: soft, finalD: finalD };
  }

  var items = sections.map(function (section, index) {
    var item = makeSvg(index);
    section.insertBefore(item.svg, section.firstChild);
    section.classList.remove('wave-play');
    return Object.assign({ section: section, played: false }, item);
  });

  function animateWave(item) {
    if (item.played) return;
    item.played = true;
    item.section.classList.add('wave-play');

    var duration = 2500;
    var start = performance.now();

    function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }

    function frame(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = easeOutCubic(p);
      var energy = 1 - eased;
      var amp = 12 + Math.sin(p * Math.PI * 5) * 12 * energy + 22 * energy;
      var phase = 0.55 + p * Math.PI * 3.4;
      var yShift = Math.sin(p * Math.PI * 4) * 8 * energy;

      item.path.setAttribute('d', makePath(p, Math.max(12, Math.abs(amp)), phase));
      item.path.setAttribute('transform', 'translate(0 ' + yShift.toFixed(2) + ')');
      item.soft.setAttribute('d', makePath(p, Math.max(8, Math.abs(amp * .72)), phase + .85));
      item.soft.setAttribute('transform', 'translate(0 ' + (10 - yShift * .45).toFixed(2) + ')');

      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        item.path.setAttribute('d', item.finalD);
        item.path.setAttribute('transform', 'translate(0 0)');
        item.soft.setAttribute('d', makePath(1, 10, 1.35));
        item.soft.setAttribute('transform', 'translate(0 10)');
      }
    }
    requestAnimationFrame(frame);
  }

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach(function (item) { item.section.classList.add('wave-play'); });
    return;
  }

  if (!('IntersectionObserver' in window)) {
    items.forEach(animateWave);
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var found = items.find(function (item) { return item.section === entry.target; });
        if (found) animateWave(found);
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.22,
    rootMargin: '0px 0px -12% 0px'
  });

  items.forEach(function (item) { observer.observe(item.section); });
})();

// 最終修正：画面に入った瞬間、SVGのd属性を大きく変形させて“実際に波打つ”→静止で止める
(function () {
  function initStrongSectionWaves() {
    var sections = Array.prototype.slice.call(document.querySelectorAll('.section'));
    if (!sections.length) return;

    // 以前の弱い波SVGを削除して、強い波だけに統一
    document.querySelectorAll('.section-wave').forEach(function (el) { el.remove(); });
    sections.forEach(function (section) {
      section.classList.remove('wave-play', 'is-wave-animating');
    });

    var width = 1440;
    var height = 104;

    function makePath(amp, phase, lift) {
      var step = 36;
      var baseY = 52 + (lift || 0);
      var d = '';
      for (var x = 0; x <= width; x += step) {
        var nx = x / width;
        var y = baseY
          + Math.sin(nx * Math.PI * 2.05 + phase) * amp
          + Math.sin(nx * Math.PI * 5.4 + phase * .74) * amp * .28;
        if (x === 0) {
          d = 'M' + x + ',' + y.toFixed(2);
        } else {
          var prevX = x - step;
          var prevNx = prevX / width;
          var prevY = baseY
            + Math.sin(prevNx * Math.PI * 2.05 + phase) * amp
            + Math.sin(prevNx * Math.PI * 5.4 + phase * .74) * amp * .28;
          var cx = x - step / 2;
          d += ' C' + cx + ',' + prevY.toFixed(2) + ' ' + cx + ',' + y.toFixed(2) + ' ' + x + ',' + y.toFixed(2);
        }
      }
      return d;
    }

    function createWave(index) {
      var ns = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('class', 'section-wave');
      svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.setAttribute('aria-hidden', 'true');

      var defs = document.createElementNS(ns, 'defs');
      var grad = document.createElementNS(ns, 'linearGradient');
      var gradId = 'strongSectionWaveGradient-' + index;
      grad.setAttribute('id', gradId);
      grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%');
      grad.setAttribute('x2', '100%'); grad.setAttribute('y2', '0%');
      [['0%', '#00a98f'], ['52%', '#35d39a'], ['100%', '#9be15d']].forEach(function (item) {
        var stop = document.createElementNS(ns, 'stop');
        stop.setAttribute('offset', item[0]);
        stop.setAttribute('stop-color', item[1]);
        grad.appendChild(stop);
      });
      defs.appendChild(grad);
      svg.appendChild(defs);

      var soft = document.createElementNS(ns, 'path');
      soft.setAttribute('class', 'section-wave__path--soft');
      soft.setAttribute('d', makePath(12, 1.35, 10));
      svg.appendChild(soft);

      var path = document.createElementNS(ns, 'path');
      path.setAttribute('class', 'section-wave__path');
      path.setAttribute('stroke', 'url(#' + gradId + ')');
      path.setAttribute('d', makePath(14, .55, 0));
      svg.appendChild(path);

      return { svg: svg, path: path, soft: soft };
    }

    var items = sections.map(function (section, index) {
      var wave = createWave(index);
      section.insertBefore(wave.svg, section.firstChild);
      return {
        section: section,
        path: wave.path,
        soft: wave.soft,
        played: false
      };
    });

    function animate(item) {
      if (item.played) return;
      item.played = true;
      item.section.classList.add('wave-play', 'is-wave-animating');

      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        item.path.setAttribute('d', makePath(14, .55, 0));
        item.soft.setAttribute('d', makePath(12, 1.35, 10));
        item.section.classList.remove('is-wave-animating');
        return;
      }

      var duration = 3600;
      var start = performance.now();
      function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

      function frame(now) {
        var p = Math.min((now - start) / duration, 1);
        var settle = easeOutExpo(p);
        var energy = 1 - settle;

        // 最初は大きく波打ち、徐々に現在の静止波形へ収束
        var amp = 14 + energy * 54 + Math.sin(p * Math.PI * 7) * energy * 18;
        var phase = .55 + p * Math.PI * 8.2;
        var lift = Math.sin(p * Math.PI * 6) * energy * 11;
        var softAmp = 12 + energy * 34;

        item.path.setAttribute('d', makePath(Math.max(14, Math.abs(amp)), phase, lift));
        item.soft.setAttribute('d', makePath(Math.max(12, Math.abs(softAmp)), phase + .85, 10 - lift * .35));

        if (p < 1) {
          requestAnimationFrame(frame);
        } else {
          item.path.setAttribute('d', makePath(14, .55, 0));
          item.soft.setAttribute('d', makePath(12, 1.35, 10));
          item.section.classList.remove('is-wave-animating');
        }
      }
      requestAnimationFrame(frame);
    }

    // 既に画面内にあるものも少し遅らせて必ず動かす
    function isInView(el) {
      var r = el.getBoundingClientRect();
      return r.top < window.innerHeight * .82 && r.bottom > window.innerHeight * .12;
    }
    items.forEach(function (item, i) {
      if (isInView(item.section)) setTimeout(function () { animate(item); }, 180 + i * 80);
    });

    if (!('IntersectionObserver' in window)) {
      window.addEventListener('scroll', function () {
        items.forEach(function (item) { if (isInView(item.section)) animate(item); });
      }, { passive: true });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var target = items.find(function (item) { return item.section === entry.target; });
          if (target) animate(target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .16, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (item) { observer.observe(item.section); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStrongSectionWaves);
  } else {
    initStrongSectionWaves();
  }
})();

// ===== 確実版：IntersectionObserver + requestAnimationFrameで波線の形そのものを動かす =====
(function(){
  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function(){
    var sections = Array.prototype.slice.call(document.querySelectorAll('.section'));
    if(!sections.length) return;

    // 旧版の波線を完全削除
    document.querySelectorAll('.section-wave,.actual-wave-svg').forEach(function(el){ el.remove(); });

    var W = 1440;
    var H = 126;
    var baseAmp = 18;
    var basePhase = 0.85;

    function waveD(amp, phase, baseShift){
      var step = 32;
      var baseY = 58 + (baseShift || 0);
      var d = '';
      for(var x=0; x<=W; x+=step){
        var n = x / W;
        var y = baseY
          + Math.sin(n * Math.PI * 2.2 + phase) * amp
          + Math.sin(n * Math.PI * 6.0 + phase * 0.72) * amp * 0.22;
        if(x === 0){
          d = 'M' + x + ',' + y.toFixed(1);
        }else{
          var px = x - step;
          var pn = px / W;
          var py = baseY
            + Math.sin(pn * Math.PI * 2.2 + phase) * amp
            + Math.sin(pn * Math.PI * 6.0 + phase * 0.72) * amp * 0.22;
          var cx = x - step / 2;
          d += ' C' + cx + ',' + py.toFixed(1) + ' ' + cx + ',' + y.toFixed(1) + ' ' + x + ',' + y.toFixed(1);
        }
      }
      return d;
    }

    function createSvg(i){
      var ns = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('class','actual-wave-svg');
      svg.setAttribute('viewBox','0 0 '+W+' '+H);
      svg.setAttribute('preserveAspectRatio','none');
      svg.setAttribute('aria-hidden','true');

      var defs = document.createElementNS(ns,'defs');
      var grad = document.createElementNS(ns,'linearGradient');
      var id = 'actualWaveGradient' + i;
      grad.setAttribute('id', id);
      grad.setAttribute('x1','0%'); grad.setAttribute('y1','0%');
      grad.setAttribute('x2','100%'); grad.setAttribute('y2','0%');
      [['0%','#00a98f'],['52%','#35d39a'],['100%','#9be15d']].forEach(function(s){
        var stop = document.createElementNS(ns,'stop');
        stop.setAttribute('offset',s[0]);
        stop.setAttribute('stop-color',s[1]);
        grad.appendChild(stop);
      });
      defs.appendChild(grad);
      svg.appendChild(defs);

      var soft = document.createElementNS(ns,'path');
      soft.setAttribute('class','actual-wave-soft');
      soft.setAttribute('d', waveD(12, 1.55, 11));
      svg.appendChild(soft);

      var path = document.createElementNS(ns,'path');
      path.setAttribute('class','actual-wave-path');
      path.setAttribute('stroke','url(#'+id+')');
      path.style.stroke = 'url(#' + id + ')';
      path.setAttribute('d', waveD(baseAmp, basePhase, 0));
      svg.appendChild(path);
      return {svg:svg, path:path, soft:soft};
    }

    var entries = sections.map(function(section, i){
      var parts = createSvg(i);
      section.insertBefore(parts.svg, section.firstChild);
      return {section:section, path:parts.path, soft:parts.soft, running:false};
    });

    function animateWave(item){
      if(item.running) return;
      item.running = true;
      var duration = 3200;
      var start = performance.now();
      var softBaseAmp = 12;
      var softBasePhase = 1.55;
      var softBaseShift = 11;

      function easeInOut(t){
        return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      }
      function tick(now){
        var p = Math.min((now - start) / duration, 1);
        var e = easeInOut(p);

        // 1回だけ、呼吸するように持ち上がって、同じ形に戻る。
        // 最終フレームの計算値を静止状態と完全一致させ、最後のカクつきを防ぐ。
        var pulse = Math.sin(e * Math.PI);
        var amp = baseAmp + pulse * 28;
        var phase = basePhase + pulse * 1.05;
        var shift = pulse * 12;
        var softAmp = softBaseAmp + pulse * 12;
        var softPhase = softBasePhase + pulse * .75;
        var softShift = softBaseShift - pulse * 3;

        if(p >= 1){
          amp = baseAmp;
          phase = basePhase;
          shift = 0;
          softAmp = softBaseAmp;
          softPhase = softBasePhase;
          softShift = softBaseShift;
        }

        item.path.setAttribute('d', waveD(amp, phase, shift));
        item.soft.setAttribute('d', waveD(softAmp, softPhase, softShift));

        if(p < 1){
          requestAnimationFrame(tick);
        }else{
          item.running = false;
        }
      }
      requestAnimationFrame(tick);
    }

    function isVisible(section){
      var r = section.getBoundingClientRect();
      return r.top < window.innerHeight * .78 && r.bottom > window.innerHeight * .18;
    }

    // 初期表示分も必ず再生
    entries.forEach(function(item, i){
      if(isVisible(item.section)) setTimeout(function(){ animateWave(item); }, 250 + i * 120);
    });

    // 表示されるたび再生。1回だけではなく、戻ってきても動く。
    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(records){
        records.forEach(function(record){
          if(record.isIntersecting){
            var item = entries.find(function(e){ return e.section === record.target; });
            if(item) animateWave(item);
          }
        });
      }, {threshold:.28, rootMargin:'0px 0px -10% 0px'});
      entries.forEach(function(item){ io.observe(item.section); });
    }else{
      window.addEventListener('scroll', function(){
        entries.forEach(function(item){ if(isVisible(item.section)) animateWave(item); });
      }, {passive:true});
    }
  });
})();

// ===== 最終調整：タイトル下波線を幅100％・右→左に1回だけ波打たせる =====
(function(){
  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function(){
    // 旧来のセクション上部波線を削除
    document.querySelectorAll('.actual-wave-svg,.section-wave').forEach(function(el){ el.remove(); });

    var heads = Array.prototype.slice.call(document.querySelectorAll('.section__head, .about__body, .greeting__body'));
    if(!heads.length) return;

    var W = 1400;
    var H = 48;
    var baseAmp = 4.8;
    var basePhase = .72;
    var baseY = 20;

    function waveD(amp, phase, shift){
      var step = 56;
      var d = '';
      for(var x=0; x<=W; x+=step){
        var n = x / W;
        var y = baseY + (shift || 0)
          + Math.sin(n * Math.PI * 2.05 + phase) * amp
          + Math.sin(n * Math.PI * 4.2 + phase * .62) * amp * .14;
        if(x === 0){
          d = 'M' + x + ',' + y.toFixed(2);
        }else{
          var px = x - step;
          var pn = px / W;
          var py = baseY + (shift || 0)
            + Math.sin(pn * Math.PI * 2.05 + phase) * amp
            + Math.sin(pn * Math.PI * 4.2 + phase * .62) * amp * .14;
          var cx = x - step / 2;
          d += ' C' + cx + ',' + py.toFixed(2) + ' ' + cx + ',' + y.toFixed(2) + ' ' + x + ',' + y.toFixed(2);
        }
      }
      return d;
    }

    function createWave(i){
      var ns = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(ns,'svg');
      svg.setAttribute('class','title-wave-svg');
      svg.setAttribute('viewBox','0 0 '+W+' '+H);
      svg.setAttribute('preserveAspectRatio','none');
      svg.setAttribute('aria-hidden','true');

      var defs = document.createElementNS(ns,'defs');
      var grad = document.createElementNS(ns,'linearGradient');
      var id = 'titleWaveGradient' + i;
      grad.setAttribute('id', id);
      grad.setAttribute('x1','0%'); grad.setAttribute('y1','0%');
      grad.setAttribute('x2','100%'); grad.setAttribute('y2','0%');
      [['0%','#00a98f'],['52%','#35d39a'],['100%','#9be15d']].forEach(function(s){
        var stop = document.createElementNS(ns,'stop');
        stop.setAttribute('offset',s[0]);
        stop.setAttribute('stop-color',s[1]);
        grad.appendChild(stop);
      });
      defs.appendChild(grad);
      svg.appendChild(defs);

      var soft = document.createElementNS(ns,'path');
      soft.setAttribute('class','title-wave-soft');
      soft.setAttribute('d', waveD(3.1, 1.38, 6));
      svg.appendChild(soft);

      var path = document.createElementNS(ns,'path');
      path.setAttribute('class','title-wave-path');
      path.setAttribute('stroke','url(#'+id+')');
      path.style.stroke = 'url(#' + id + ')';
      path.setAttribute('d', waveD(baseAmp, basePhase, 0));
      svg.appendChild(path);
      return {svg:svg,path:path,soft:soft};
    }

    var items = [];
    heads.forEach(function(head,i){
      var title = head.querySelector('.section__title');
      if(!title) return;
      // 既存のタイトル波線があれば除去して二重表示を防ぐ
      var old = head.querySelector('.title-wave-svg');
      if(old) old.remove();
      var wave = createWave(i);
      title.insertAdjacentElement('afterend', wave.svg);
      items.push({head:head,path:wave.path,soft:wave.soft,running:false,inView:false});
    });

    function easeInOutSine(t){ return -(Math.cos(Math.PI * t) - 1) / 2; }

    function animate(item){
      if(item.running) return;
      item.running = true;
      var duration = 3600;
      var start = performance.now();
      var softBaseAmp = 3.1;
      var softBasePhase = 1.38;
      var softBaseShift = 6;

      function tick(now){
        var p = Math.min((now - start) / duration, 1);
        var e = easeInOutSine(p);
        // 右→左へ1回だけ流れる。phaseを2π進めるため、終了形は開始形と完全一致する。
        var phaseMove = Math.PI * 2 * e;
        var pulse = Math.sin(Math.PI * e);
        var amp = baseAmp + pulse * 9.5;
        var phase = basePhase + phaseMove;
        var shift = pulse * 2.8;
        var softAmp = softBaseAmp + pulse * 5.5;
        var softPhase = softBasePhase + phaseMove;
        var softShift = softBaseShift + pulse * 1.6;

        if(p >= 1){
          item.path.setAttribute('d', waveD(baseAmp, basePhase, 0));
          item.soft.setAttribute('d', waveD(softBaseAmp, softBasePhase, softBaseShift));
          item.running = false;
          return;
        }
        item.path.setAttribute('d', waveD(amp, phase, shift));
        item.soft.setAttribute('d', waveD(softAmp, softPhase, softShift));
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          var item = items.find(function(v){ return v.head === entry.target; });
          if(!item) return;
          if(entry.isIntersecting){
            if(!item.inView){
              item.inView = true;
              animate(item);
            }
          }else{
            // 画面外に出たら再入場時にもう一度だけ動く
            item.inView = false;
          }
        });
      }, {threshold:.28, rootMargin:'0px 0px -6% 0px'});
      items.forEach(function(item){ io.observe(item.head); });
    }else{
      items.forEach(function(item){ animate(item); });
    }
  });
})();

// 電話番号ポップアップ
(function(){
  var modal = document.getElementById('phoneModal');
  if(!modal) return;
  var openers = document.querySelectorAll('.phone-modal-open');
  var closers = modal.querySelectorAll('[data-phone-close]');
  function openModal(){
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
  }
  function closeModal(){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden','true');
  }
  openers.forEach(function(btn){ btn.addEventListener('click', openModal); });
  closers.forEach(function(btn){ btn.addEventListener('click', closeModal); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeModal(); });
})();

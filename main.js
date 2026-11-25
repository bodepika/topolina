(() => {
  'use strict';

  const C = window.CONFIG || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const G = window.gsap;
  const hasST = !!(G && window.ScrollTrigger);
  if (hasST) G.registerPlugin(ScrollTrigger);

  const nome1 = C.nome1 || 'Eu';
  const nome2 = C.nome2 || 'Você';
  const apelidos = (C.apelidos && C.apelidos.length) ? C.apelidos : ['amor'];

  let W = innerWidth, H = innerHeight;
  const P = { x: W / 2, y: H / 2, seen: false };

  const splitChars = t => [...t].map(ch => ch === ' '
    ? '<span class="sp"> </span>'
    : `<span class="ch"><span class="ci">${esc(ch)}</span></span>`).join('');

  // ---------------------------------------------------------------- content
  document.title = `${nome2} ♥`;
  $('#from').textContent = `de ${nome1}, para`;
  $('#heroName').innerHTML = splitChars(nome2);
  $('#foot').innerHTML = `feito à mão, com amor, por <b>${esc(nome1)}</b>`;
  $('#letterSign').textContent = C.assinatura || (nome1 + ' ♥');

  // marquee
  const mq = $('#marquee');
  const mqHtml = apelidos.map(a => `<span>${esc(a)}</span><span class="star">✦</span>`).join('');
  mq.innerHTML = mqHtml + mqHtml + mqHtml + mqHtml;

  // phrases
  const phWrap = $('#phrases');
  const wordsHtml = line => line.split(/\s+/).filter(Boolean).map(w => {
    const m = w.match(/^\*(.+)\*([.,!?;:…]*)$/);
    return m ? `<span class="w accent">${esc(m[1])}</span>${m[2] ? `<span class="w">${esc(m[2])}</span>` : ''}`
             : `<span class="w">${esc(w)}</span>`;
  }).join(' ');
  (C.frases || []).forEach((f, i) => {
    const texto = typeof f === 'string' ? f : (f.texto || '');
    const s = document.createElement('section');
    const long = texto.includes('\n') || texto.length > 140;
    s.className = 'phrase' + (long ? ' long' : '');
    if (f.lang) s.lang = f.lang;
    const body = texto.trim().split(/\n\s*\n/)
      .map(par => `<p>${par.split('\n').map(wordsHtml).join('<br>')}</p>`).join('');
    s.innerHTML = `<span class="phrase-num">${String(i + 1).padStart(2, '0')}</span><div class="phrase-body">${body}</div>`;
    phWrap.appendChild(s);
  });

  // gallery
  const fotos = (C.fotos && C.fotos.length) ? C.fotos
    : Array.from({ length: 5 }, (_, i) => ({ placeholder: true, legenda: `foto ${i + 1} — em breve` }));
  const track = $('#track');
  fotos.forEach((f, i) => {
    const fig = document.createElement('figure');
    fig.className = 'card';
    fig.dataset.i = i;
    if (!f.placeholder) fig.dataset.cursor = 'ver';
    fig.innerHTML = `<div class="card-in">${f.placeholder
      ? '<div class="ph"><span>♥</span></div>'
      : `<img loading="lazy" src="${esc(f.arquivo)}" alt="${esc(f.legenda || '')}">`}<div class="glare"></div></div>
      <figcaption><span class="num">${String(i + 1).padStart(2, '0')}</span><span></span></figcaption>`;
    fig.querySelector('figcaption span:last-child').textContent = f.legenda || '';
    track.appendChild(fig);
  });

  // featured photo
  const feat = C.destaque;
  if (feat && feat.arquivo) {
    $('#feature').hidden = false;
    $('#featureImg').src = feat.arquivo;
    $('#featureText').innerHTML = wordsHtml(feat.frase || '');
    const pol = $('#polaroid'), polIn = $('.polaroid-in', pol);
    pol.addEventListener('pointermove', e => {
      const r = polIn.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      polIn.style.transform = `rotateY(${(x - 0.5) * 16}deg) rotateX(${(0.5 - y) * 16}deg)`;
      polIn.style.setProperty('--gx', x * 100 + '%');
      polIn.style.setProperty('--gy', y * 100 + '%');
    });
    pol.addEventListener('pointerleave', () => { polIn.style.transform = ''; });
    pol.addEventListener('click', e => { const r = polIn.getBoundingClientRect(); burst(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2, 24, 6); });
  }

  // ---------------------------------------------------------------- smooth scroll
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.stop();
    if (hasST) {
      lenis.on('scroll', ScrollTrigger.update);
      G.ticker.add(t => lenis.raf(t * 1000));
      G.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  // ---------------------------------------------------------------- pointer
  addEventListener('pointermove', e => { P.x = e.clientX; P.y = e.clientY; P.seen = true; }, { passive: true });
  addEventListener('pointerdown', e => { P.x = e.clientX; P.y = e.clientY; P.seen = true; }, { passive: true });
  addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') setTimeout(() => { P.seen = false; }, 700); });
  document.addEventListener('mouseleave', () => { P.seen = false; });

  // ---------------------------------------------------------------- hearts fx
  const fx = $('#fx'), ctx = fx.getContext('2d');
  let DPR = Math.min(2, devicePixelRatio || 1);
  function sizeFx() { DPR = Math.min(2, devicePixelRatio || 1); fx.width = W * DPR; fx.height = H * DPR; }
  sizeFx();
  const COLORS = ['#ff5c7a', '#ff9aae', '#ffd29a', '#fbeee6', '#ff3d63'];
  const parts = [];
  function spawn(x, y, o = {}) {
    if (parts.length > 700) parts.shift();
    parts.push({
      x, y, vx: o.vx || 0, vy: o.vy || 0, g: o.g ?? 0.07, life: 0,
      max: o.max || 60 + Math.random() * 50, s: o.s || 6 + Math.random() * 10,
      r: (Math.random() - 0.5) * 0.6, vr: (Math.random() - 0.5) * 0.08,
      c: o.c || COLORS[(Math.random() * COLORS.length) | 0],
    });
  }
  function burst(x, y, n = 18, power = 6) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = power * (0.35 + Math.random());
      spawn(x, y, { vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2 });
    }
  }
  function heartPath(s) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.3);
    ctx.bezierCurveTo(s * 0.5, -s * 0.95, s * 1.25, -s * 0.15, 0, s * 0.75);
    ctx.bezierCurveTo(-s * 1.25, -s * 0.15, -s * 0.5, -s * 0.95, 0, -s * 0.3);
  }
  function drawFx() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life++;
      p.vx *= 0.98; p.vy = p.vy * 0.98 + p.g;
      p.x += p.vx; p.y += p.vy; p.r += p.vr;
      const k = 1 - p.life / p.max;
      if (k <= 0) { parts.splice(i, 1); continue; }
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.globalAlpha = Math.min(1, k * 1.4);
      ctx.fillStyle = p.c;
      heartPath(p.s * (0.5 + 0.5 * k));
      ctx.fill();
      ctx.restore();
    }
  }

  addEventListener('click', e => {
    if (e.target.closest('#hold, #loader, #lb, #letterModal')) return;
    burst(e.clientX, e.clientY, 14, 4.5);
  });

  // ---------------------------------------------------------------- floating nicknames
  const bg = $('#bg');
  const N = reduce ? 12 : (W < 700 ? 18 : 32);
  const items = [];
  for (let i = 0; i < N; i++) {
    const el = document.createElement('span');
    el.className = 'nn ' + (i % 2 ? 'f1' : 'f2');
    el.textContent = apelidos[i % apelidos.length];
    const z = 0.15 + Math.random() * 0.85;
    el.style.fontSize = (14 + z * (W < 700 ? 30 : 54)).toFixed(0) + 'px';
    el.style.setProperty('--o', (0.05 + z * 0.17).toFixed(2));
    if (z < 0.42) el.style.filter = `blur(${((0.42 - z) * 6).toFixed(1)}px)`;
    bg.appendChild(el);
    items.push({
      el, z, x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() < 0.5 ? -1 : 1) * (0.12 + Math.random() * 0.3) * (0.4 + z),
      vy: -(0.04 + Math.random() * 0.16) * z,
      ox: 0, oy: 0, ovx: 0, ovy: 0, rot: (Math.random() - 0.5) * 18,
      ph: Math.random() * 6.28, lit: 0, litShown: -1,
    });
  }
  function updateBg(t, sy) {
    const R = W < 700 ? 120 : 190;
    const spanY = H + 240, spanX = W + 360;
    for (const it of items) {
      if (!reduce) { it.x += it.vx; it.y += it.vy; }
      const by = (((it.y - sy * it.z * 0.4) % spanY) + spanY) % spanY - 120;
      const bx = ((it.x % spanX) + spanX) % spanX - 180;
      const px = bx + it.ox, py = by + it.oy;
      const dx = px - P.x, dy = py - P.y;
      const d = Math.hypot(dx, dy) || 1;
      if (P.seen && d < R) {
        const f = (1 - d / R) * 1.5 * (0.4 + it.z);
        it.ovx += (dx / d) * f; it.ovy += (dy / d) * f;
      }
      it.ovx = (it.ovx - it.ox * 0.014) * 0.9;
      it.ovy = (it.ovy - it.oy * 0.014) * 0.9;
      it.ox += it.ovx; it.oy += it.ovy;
      const near = P.seen && d < R * 0.8 ? 1 : 0;
      it.lit += (near - it.lit) * 0.07;
      const r = it.rot + Math.sin(t * 0.0006 + it.ph) * 5;
      it.el.style.transform = `translate3d(${px.toFixed(1)}px,${py.toFixed(1)}px,0) translate(-50%,-50%) rotate(${r.toFixed(1)}deg) scale(${(1 + it.lit * 0.22).toFixed(3)})`;
      const l = Math.round(it.lit * 50) / 50;
      if (l !== it.litShown) { it.el.style.setProperty('--lit', l); it.litShown = l; }
    }
  }

  // ---------------------------------------------------------------- cursor + glow
  const cur = $('#cursor'), dot = $('.dot', cur), ring = $('.ring', cur), ringLabel = $('.ring span', cur);
  const glow = $('#glow');
  const cr = { x: W / 2, y: H / 2 }, gl = { x: W / 2, y: H / 2 };
  let lastTrail = { x: 0, y: 0 };
  document.addEventListener('pointerover', e => {
    const el = e.target.closest('button, a, [data-cursor], .envelope');
    cur.classList.toggle('hover', !!el);
    ringLabel.textContent = el ? (el.dataset.cursor || '') : '';
  });

  // magnetic buttons
  $$('.magnetic').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
      b.style.translate = `${x * 0.3}px ${y * 0.4}px`;
    });
    b.addEventListener('pointerleave', () => { b.style.translate = ''; });
  });

  // ---------------------------------------------------------------- hero letters
  const heroChars = $$('#heroName .ch').map(el => ({ el, x: 0, y: 0, r: 0 }));
  function updateHero(sy) {
    if (sy > H) return;
    for (const c of heroChars) {
      const b = c.el.getBoundingClientRect();
      const cx = b.left + b.width / 2 - c.x, cy = b.top + b.height / 2 - c.y;
      const dx = P.x - cx, dy = P.y - cy, d = Math.hypot(dx, dy);
      const R = Math.max(220, b.height * 1.4);
      let tx = 0, ty = 0, tr = 0;
      if (P.seen && d < R) {
        const k = 1 - d / R;
        tx = -dx / d * k * 18; ty = -k * 26; tr = (dx > 0 ? -1 : 1) * k * 8;
      }
      c.x += (tx - c.x) * 0.12; c.y += (ty - c.y) * 0.12; c.r += (tr - c.r) * 0.12;
      c.el.style.transform = `translate(${c.x.toFixed(2)}px,${c.y.toFixed(2)}px) rotate(${c.r.toFixed(2)}deg)`;
    }
  }

  // nickname rotator
  const nickEl = $('#nick');
  let ni = 0;
  nickEl.textContent = apelidos[0];
  setInterval(() => {
    ni = (ni + 1) % apelidos.length;
    if (!G || reduce) { nickEl.textContent = apelidos[ni]; return; }
    G.to(nickEl, {
      yPercent: -110, opacity: 0, duration: 0.45, ease: 'power3.in',
      onComplete() {
        nickEl.textContent = apelidos[ni];
        G.fromTo(nickEl, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out' });
      },
    });
  }, 2400);

  // ---------------------------------------------------------------- time together
  const start = new Date((C.dataInicio || '2024-01-01') + 'T00:00:00');
  const elapsed = () => Math.max(0, Date.now() - start.getTime());
  const pad = n => String(n).padStart(2, '0');
  const fmt = n => n.toLocaleString('pt-BR');
  $('#since').textContent = (C.textoDesde || 'desde') + ' ' + start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  const daysEl = $('#days');
  const totalDays = () => Math.floor(elapsed() / 864e5);
  let daysCounted = false;
  function tickTime() {
    const ms = elapsed();
    $('#hh').textContent = pad(Math.floor(ms / 36e5) % 24);
    $('#mm').textContent = pad(Math.floor(ms / 6e4) % 60);
    $('#ss').textContent = pad(Math.floor(ms / 1e3) % 60);
    $('#beats').textContent = fmt(Math.floor(ms / 6e4 * 75));
    if (daysCounted) daysEl.textContent = fmt(totalDays());
  }
  tickTime();
  setInterval(tickTime, 1000);
  function countDays() {
    if (daysCounted) return;
    const obj = { v: 0 }, target = totalDays();
    if (!G || reduce) { daysCounted = true; daysEl.textContent = fmt(target); return; }
    G.to(obj, {
      v: target, duration: 2.4, ease: 'expo.out',
      onUpdate: () => { daysEl.textContent = fmt(Math.round(obj.v)); },
      onComplete: () => { daysCounted = true; },
    });
  }

  // ---------------------------------------------------------------- marquee
  let mqX = 0, mqSkew = 0;
  function updateMarquee() {
    const half = mq.scrollWidth / 2;
    const v = lenis ? lenis.velocity : 0;
    mqX -= 0.6 + Math.abs(v) * 0.35;
    if (half > 0 && -mqX >= half) mqX += half;
    mqSkew += ((Math.max(-12, Math.min(12, v * 0.6))) - mqSkew) * 0.1;
    mq.style.transform = `translate3d(${mqX.toFixed(1)}px,0,0) skewX(${(-mqSkew).toFixed(2)}deg)`;
  }

  // ---------------------------------------------------------------- tilt cards
  $$('.card').forEach(card => {
    const inner = $('.card-in', card);
    card.addEventListener('pointermove', e => {
      const r = inner.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      inner.style.transform = `rotateY(${(x - 0.5) * 18}deg) rotateX(${(0.5 - y) * 18}deg) scale(1.03)`;
      inner.style.setProperty('--gx', x * 100 + '%');
      inner.style.setProperty('--gy', y * 100 + '%');
    });
    card.addEventListener('pointerleave', () => { inner.style.transform = ''; });
    card.addEventListener('click', () => { if (!fotos[card.dataset.i].placeholder) openLb(+card.dataset.i); });
  });

  // ---------------------------------------------------------------- lightbox
  const lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  const real = fotos.map((f, i) => ({ f, i })).filter(o => !o.f.placeholder);
  let lbPos = 0;
  function openLb(i) {
    lbPos = Math.max(0, real.findIndex(o => o.i === i));
    showLb(); lb.classList.add('open'); lenis && lenis.stop();
  }
  function showLb() {
    const o = real[(lbPos + real.length) % real.length];
    lbImg.src = o.f.arquivo; lbCap.textContent = o.f.legenda || '';
    if (G && !reduce) G.fromTo(lbImg, { scale: 0.94, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' });
  }
  function closeLb() { lb.classList.remove('open'); lenis && lenis.start(); }
  const stepLb = d => { lbPos = (lbPos + d + real.length) % real.length; showLb(); };
  $('#lbClose').onclick = closeLb;
  $('#lbPrev').onclick = e => { e.stopPropagation(); stepLb(-1); };
  $('#lbNext').onclick = e => { e.stopPropagation(); stepLb(1); };
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  let swipeX = null;
  lb.addEventListener('pointerdown', e => { swipeX = e.clientX; });
  lb.addEventListener('pointerup', e => {
    if (swipeX === null) return;
    const dx = e.clientX - swipeX; swipeX = null;
    if (Math.abs(dx) > 50) stepLb(dx < 0 ? 1 : -1);
  });

  // ---------------------------------------------------------------- letter
  const env = $('#envelope'), modal = $('#letterModal'), lt = $('#letterText'), sign = $('#letterSign');
  let typing = null;
  function openLetter() {
    if (!env.classList.contains('open')) {
      env.classList.add('open');
      const r = env.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height * 0.3, 26, 6);
      setTimeout(showLetter, 1300);
    } else showLetter();
  }
  function showLetter() {
    modal.classList.add('open'); lenis && lenis.stop();
    if (G && !reduce) G.fromTo('.sheet', { y: 60, rotate: -2, opacity: 0 }, { y: 0, rotate: 0, opacity: 1, duration: 0.8, ease: 'expo.out' });
    const text = C.carta || '';
    clearInterval(typing);
    lt.classList.remove('done'); sign.classList.remove('show');
    if (reduce) { lt.textContent = text; finishType(); return; }
    let i = 0; lt.textContent = '';
    typing = setInterval(() => {
      i += 1; lt.textContent = text.slice(0, i);
      if (i >= text.length) finishType();
    }, 32);
  }
  function finishType() { clearInterval(typing); typing = null; lt.textContent = C.carta || ''; lt.classList.add('done'); sign.classList.add('show'); }
  function closeLetter() { modal.classList.remove('open'); lenis && lenis.start(); }
  env.addEventListener('click', openLetter);
  env.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLetter(); } });
  lt.addEventListener('click', () => { if (typing) finishType(); });
  $('#letterClose').onclick = closeLetter;
  modal.addEventListener('click', e => { if (e.target === modal) closeLetter(); });

  addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeLb(); closeLetter(); }
    if (lb.classList.contains('open')) {
      if (e.key === 'ArrowLeft') stepLb(-1);
      if (e.key === 'ArrowRight') stepLb(1);
    }
  });

  // ---------------------------------------------------------------- hold the heart
  const hold = $('#hold'), holdRing = $('#holdRing');
  const LEN = 2 * Math.PI * 54;
  holdRing.style.strokeDasharray = LEN;
  holdRing.style.strokeDashoffset = LEN;
  let prog = 0, holding = false, done = false, lastVib = 0;
  const startHold = e => { if (e) e.preventDefault(); holding = true; };
  const endHold = () => { holding = false; };
  hold.addEventListener('pointerdown', e => { startHold(e); try { hold.setPointerCapture(e.pointerId); } catch (_) {} });
  hold.addEventListener('pointerup', endHold);
  hold.addEventListener('pointercancel', endHold);
  hold.addEventListener('lostpointercapture', endHold);
  hold.addEventListener('contextmenu', e => e.preventDefault());
  hold.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) startHold(e); });
  hold.addEventListener('keyup', endHold);

  function updateHold(dt, t) {
    if (done) return;
    prog = holding ? Math.min(1, prog + dt / 1800) : Math.max(0, prog - dt / 700);
    holdRing.style.strokeDashoffset = LEN * (1 - prog);
    hold.style.setProperty('--p', prog.toFixed(3));
    if (holding) {
      const r = hold.getBoundingClientRect();
      if (Math.random() < 0.35) {
        spawn(r.left + r.width / 2 + (Math.random() - 0.5) * 60, r.top + r.height / 2,
          { vx: (Math.random() - 0.5) * 2, vy: -2 - Math.random() * 3 * (1 + prog), g: -0.02, s: 5 + Math.random() * 8 });
      }
      if (navigator.vibrate && t - lastVib > 260) { navigator.vibrate(12 + prog * 30); lastVib = t; }
    }
    if (prog >= 1) { done = true; finale(); }
  }

  function finale() {
    hold.classList.add('done');
    $('#holdTitle').textContent = 'Agora sente?';
    const r = hold.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    burst(cx, cy, 90, 12);
    navigator.vibrate && navigator.vibrate([60, 60, 120]);
    const msg = $('#finalMsg');
    msg.innerHTML = splitChars(C.fraseFinal || 'Eu te amo');
    if (G && !reduce) {
      G.fromTo($$('.ci', msg), { yPercent: 115, rotate: 8 }, { yPercent: 0, rotate: 0, duration: 1.2, stagger: 0.05, ease: 'expo.out' });
    }
    // heart rain
    const t0 = performance.now();
    const rain = () => {
      if (performance.now() - t0 > 5000) return;
      for (let i = 0; i < 3; i++) spawn(Math.random() * W, -20, { vy: 1 + Math.random() * 2, vx: (Math.random() - 0.5) * 1.5, g: 0.03, max: 160, s: 6 + Math.random() * 12 });
      requestAnimationFrame(rain);
    };
    rain();
  }

  // ---------------------------------------------------------------- music
  const soundBtn = $('#sound');
  let audio = null;
  if (C.musica) {
    audio = new Audio(C.musica);
    audio.loop = true; audio.volume = 0.6;
    soundBtn.hidden = false;
    soundBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (audio.paused) { audio.play().catch(() => {}); soundBtn.classList.add('on'); }
      else { audio.pause(); soundBtn.classList.remove('on'); }
    });
  }

  // ---------------------------------------------------------------- scroll animations
  const progressEl = $('#progress');
  if (hasST && !reduce) {
    G.set('#heroName .ci', { yPercent: 115 });
    G.set(['#from', '.sub', '.scroll-cue'], { opacity: 0, y: 20 });

    G.to('.hero-inner', {
      yPercent: -18, opacity: 0, scale: 0.94, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    $$('.reveal').forEach(el => {
      G.from(el, {
        y: 60, opacity: 0, duration: 1.2, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });

    ScrollTrigger.create({ trigger: '#time', start: 'top 60%', once: true, onEnter: countDays });

    $$('.phrase').forEach(s => {
      const ws = $$('.w', s);
      const long = s.classList.contains('long');
      G.to(ws, {
        opacity: 1, filter: 'blur(0px)', stagger: 0.12, ease: 'none',
        scrollTrigger: long
          ? { trigger: s, start: 'top 65%', end: 'bottom 75%', scrub: true }
          : { trigger: s, start: 'top 75%', end: 'center 45%', scrub: true },
      });
      if (!long) G.fromTo($('.phrase-body', s), { scale: 0.94 }, {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: s, start: 'top bottom', end: 'center center', scrub: true },
      });
    });

    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const horiz = G.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '#gallery', start: 'top top', end: () => '+=' + dist(),
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
      },
    });
    $$('.card').forEach(card => {
      G.fromTo(card, { rotate: 4, opacity: 0.6 }, {
        rotate: 0, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: card, containerAnimation: horiz, start: 'left right', end: 'center center', scrub: true },
      });
    });
    if (feat && feat.arquivo) {
      G.fromTo('#polaroid', { rotate: -14, y: 120, scale: 0.85, opacity: 0 }, {
        rotate: -3, y: 0, scale: 1, opacity: 1, ease: 'none',
        scrollTrigger: { trigger: '#feature', start: 'top 85%', end: 'top 20%', scrub: 1 },
      });
      G.to('#featureText .w', {
        opacity: 1, filter: 'blur(0px)', stagger: 0.12, ease: 'none',
        scrollTrigger: { trigger: '#featureText', start: 'top 85%', end: 'top 50%', scrub: true },
      });
      G.to('#ecg', {
        strokeDashoffset: 0, ease: 'none',
        scrollTrigger: { trigger: '.ecg', start: 'top 90%', end: 'top 55%', scrub: true },
      });
    }
    addEventListener('load', () => ScrollTrigger.refresh());
  } else {
    $('#gallery').classList.add('native');
    $$('.phrase .w, .feature-text .w').forEach(w => { w.style.opacity = 1; w.style.filter = 'none'; });
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) countDays(); }));
    io.observe($('#time'));
  }

  // ---------------------------------------------------------------- main loop
  let last = performance.now();
  function loop(t) {
    const dt = Math.min(50, t - last); last = t;
    const sy = scrollY;

    updateBg(t, sy);
    updateHero(sy);
    updateMarquee();
    updateHold(dt, t);

    if (fine) {
      dot.style.transform = `translate3d(${P.x}px,${P.y}px,0)`;
      cr.x += (P.x - cr.x) * 0.18; cr.y += (P.y - cr.y) * 0.18;
      ring.style.transform = `translate3d(${cr.x.toFixed(1)}px,${cr.y.toFixed(1)}px,0)`;
      if (P.seen && !reduce && Math.hypot(P.x - lastTrail.x, P.y - lastTrail.y) > 42) {
        spawn(P.x, P.y, { vx: (Math.random() - 0.5) * 0.6, vy: -0.6, g: -0.015, s: 3 + Math.random() * 4, max: 45 });
        lastTrail = { x: P.x, y: P.y };
      }
    }
    gl.x += (P.x - gl.x) * 0.05; gl.y += (P.y - gl.y) * 0.05;
    glow.style.transform = `translate3d(${gl.x.toFixed(1)}px,${gl.y.toFixed(1)}px,0)`;

    const max = document.documentElement.scrollHeight - H;
    progressEl.style.transform = `scaleX(${max > 0 ? (sy / max).toFixed(4) : 0})`;

    drawFx();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  addEventListener('resize', () => { W = innerWidth; H = innerHeight; sizeFx(); });

  // ---------------------------------------------------------------- loader / enter
  const loader = $('#loader'), pctEl = $('#pct'), lheart = $('#lheart'), enterBtn = $('#enter');
  const t0 = performance.now();
  const easeOut = k => 1 - Math.pow(1 - k, 3);
  function loadTick(now) {
    const k = Math.min(1, (now - t0) / 2000);
    const e = easeOut(k);
    pctEl.textContent = Math.round(e * 100);
    lheart.style.strokeDashoffset = 1 - e;
    if (k < 1) requestAnimationFrame(loadTick);
    else {
      lheart.style.fill = 'rgba(255,92,122,.9)';
      lheart.style.transition = 'fill .8s';
      enterBtn.classList.add('show');
    }
  }
  requestAnimationFrame(loadTick);

  let entered = false;
  enterBtn.addEventListener('click', () => {
    if (entered) return;
    entered = true;
    if (audio) { audio.play().then(() => soundBtn.classList.add('on')).catch(() => {}); }
    burst(W / 2, H / 2, 40, 9);
    const finish = () => {
      loader.remove();
      document.body.classList.remove('locked');
      lenis && lenis.start();
      hasST && ScrollTrigger.refresh();
    };
    if (!G || reduce) { finish(); return; }
    G.timeline()
      .to('.loader-in', { opacity: 0, y: -30, duration: 0.5, ease: 'power2.in' })
      .to(loader, { yPercent: -100, duration: 1.1, ease: 'expo.inOut', onComplete: finish })
      .to('#heroName .ci', { yPercent: 0, duration: 1.4, stagger: 0.06, ease: 'expo.out' }, '-=0.45')
      .to(['#from', '.sub', '.scroll-cue'], { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: 'expo.out' }, '-=1.1');
  });
})();

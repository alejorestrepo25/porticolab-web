// Inicio explorable: apariciones al hacer scroll, progreso, índice lateral, inclinación 3D, destello del hero,
// selector de materiales y botón para copiar el correo. Todo respeta prefers-reduced-motion.
(() => {
  const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const conMouse = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Altura real del encabezado: cada sección mide exactamente la pantalla menos el encabezado
  const medir = () => { const h = document.querySelector("header"); if (h) document.documentElement.style.setProperty("--hh", h.offsetHeight + "px"); };
  medir();
  addEventListener("resize", medir);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);

  // Aparecer al entrar en pantalla
  const aparecer = [...document.querySelectorAll('.rev')];
  if ('IntersectionObserver' in window && !reducir) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }), { threshold: 0.12 });
    aparecer.forEach(el => io.observe(el));
  } else {
    aparecer.forEach(el => el.classList.add('visto'));
  }

  // Progreso de lectura
  const barra = document.querySelector('.progreso i');
  const alScroll = () => {
    const h = document.documentElement;
    const p = h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1);
    if (barra) barra.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)) + ')';
  };
  addEventListener('scroll', alScroll, { passive: true });
  alScroll();

  // Índice lateral
  const puntos = [...document.querySelectorAll('.rail a')];
  if ('IntersectionObserver' in window && puntos.length) {
    const io2 = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      puntos.forEach(a => a.classList.toggle('activo', a.dataset.s === e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    puntos.forEach(a => { const s = document.getElementById(a.dataset.s); if (s) io2.observe(s); });
  }

  // Inclinación 3D de las tarjetas de servicios (solo con mouse)
  if (conMouse && !reducir) {
    document.querySelectorAll('.frente').forEach(t => {
      t.addEventListener('pointermove', e => {
        const r = t.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        t.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
        t.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
      });
      t.addEventListener('pointerleave', () => { t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); });
    });
  }

  // Destello que sigue al puntero sobre la foto del hero
  const vis = document.querySelector('.y2k-hero__vis');
  if (vis && conMouse) {
    vis.addEventListener('pointermove', e => {
      const r = vis.getBoundingClientRect();
      vis.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      vis.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  }

  // Materiales: se pueden tocar, y al principio van cambiando solos hasta que el visitante elige
  const botones = [...document.querySelectorAll('.mat-lista button')];
  const muestras = [...document.querySelectorAll('.mat-panel .muestra')];
  const titulo = document.getElementById('mat-titulo'), texto = document.getElementById('mat-texto');
  let auto = null, elegido = false;
  const mostrar = i => {
    botones.forEach((b, k) => b.setAttribute('aria-selected', k === i ? 'true' : 'false'));
    muestras.forEach((m, k) => m.classList.toggle('on', k === i));
    const b = botones[i];
    if (b && titulo && texto) { titulo.textContent = b.dataset.titulo; texto.textContent = b.dataset.texto; }
  };
  botones.forEach((b, i) => {
    b.addEventListener('click', () => { elegido = true; clearInterval(auto); mostrar(i); });
    b.addEventListener('mouseenter', () => { if (conMouse) { elegido = true; clearInterval(auto); mostrar(i); } });
  });
  if (botones.length) {
    mostrar(0);
    if (!reducir) {
      let n = 0;
      auto = setInterval(() => { if (elegido || document.hidden) return; n = (n + 1) % botones.length; mostrar(n); }, 3800);
    }
  }

  // Copiar el correo
  const copiar = document.querySelector('.copiar');
  if (copiar) {
    const original = copiar.textContent;
    copiar.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(copiar.dataset.copiar); copiar.textContent = 'Copiado ✓'; }
      catch (e) { location.href = 'mailto:' + copiar.dataset.copiar; return; }
      setTimeout(() => { copiar.textContent = original; }, 1800);
    });
  }
})();

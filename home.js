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

  // Índice lateral: el punto activo es el de la pantalla que cruza el centro de la ventana
  const puntos = [...document.querySelectorAll('.rail a')];
  const destinoDe = (a) => (a.dataset.s === 'proyectos' && document.querySelector('.archivo-poster')) || document.getElementById(a.dataset.s);
  const pares = puntos.map((a) => [a, destinoDe(a)]).filter((p) => p[1]);
  let marcando = 0;
  function marcar() {
    marcando = 0;
    const mitad = innerHeight / 2;
    let activo = null;
    pares.forEach(([a, el]) => { const r = el.getBoundingClientRect(); if (r.top <= mitad && r.bottom > mitad) activo = a; });
    puntos.forEach((p) => p.classList.toggle('activo', p === activo));
  }
  const pedirMarca = () => { if (!marcando) marcando = setTimeout(marcar, 40); };
  if (pares.length) {
    addEventListener('scroll', pedirMarca, { passive: true });
    addEventListener('resize', pedirMarca);
    addEventListener('load', pedirMarca);
    marcar();
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

  // Salto de pantalla en pantalla: un giro de la rueda (o una flecha) baja rápido hasta la siguiente vista
  const pantallas = [...document.querySelectorAll('[data-pantalla], #frentes, .archivo-poster, #proceso, #contacto, #inicio')].filter((e, i, a) => a.indexOf(e) === i).sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  const modoPantallas = matchMedia('(min-width: 901px) and (min-height: 560px)');
  let bloqueado = false;
  const altoEncabezado = () => (document.querySelector('header') || { offsetHeight: 0 }).offsetHeight;
  const topDe = (el) => el.getBoundingClientRect().top + scrollY - altoEncabezado();
  function actual() {
    const y = scrollY + 4;
    let k = 0;
    pantallas.forEach((p, i) => { if (topDe(p) <= y + 2) k = i; });
    return k;
  }
  function irA(i) {
    i = Math.max(0, Math.min(pantallas.length - 1, i));
    const destino = Math.min(topDe(pantallas[i]), document.documentElement.scrollHeight - innerHeight);
    bloqueado = true;
    scrollTo({ top: destino, behavior: "smooth" });
    setTimeout(() => { bloqueado = false; }, 760);
  }
  if (pantallas.length && !reducir) {
    addEventListener('wheel', (e) => {
      if (!modoPantallas.matches || e.ctrlKey || Math.abs(e.deltaY) < 6) return;
      e.preventDefault();
      if (bloqueado) return;
      irA(actual() + (e.deltaY > 0 ? 1 : -1));
    }, { passive: false });
    addEventListener('keydown', (e) => {
      if (!modoPantallas.matches || e.altKey || e.ctrlKey || e.metaKey) return;
      if (/input|textarea|select/i.test((document.activeElement || {}).tagName || '')) return;
      const k = e.key;
      if (k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey)) { e.preventDefault(); if (!bloqueado) irA(actual() + 1); }
      else if (k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey)) { e.preventDefault(); if (!bloqueado) irA(actual() - 1); }
      else if (k === 'Home') { e.preventDefault(); if (!bloqueado) irA(0); }
      else if (k === 'End') { e.preventDefault(); if (!bloqueado) irA(pantallas.length - 1); }
    });
  }

  // Ajuste automático: ninguna pantalla se sale por abajo, sin importar el tamaño de la ventana ni del encabezado
  const contenedores = () => [...document.querySelectorAll('.seccion, .cierre-home, .archivo-poster')].filter((c) => !c.parentElement.classList.contains('archivo-poster'));
  function ajustar() {
    const conAjuste = matchMedia('(min-width: 901px) and (min-height: 560px)').matches;
    const disponible = innerHeight - altoEncabezado();
    contenedores().forEach((c) => {
      c.style.removeProperty('--k');
      if (!conAjuste) return;
      let k = 1;
      for (let i = 0; i < 4; i++) {
        const h = c.getBoundingClientRect().height;
        if (h <= disponible + 1) break;
        k = Math.max(0.55, k * (disponible / h) * 0.985);
        c.style.setProperty('--k', k.toFixed(3));
      }
    });
  }
  let pendiente = 0;
  const pedirAjuste = () => { clearTimeout(pendiente); pendiente = setTimeout(ajustar, 140); };
  addEventListener('resize', pedirAjuste);
  addEventListener('load', pedirAjuste);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pedirAjuste);
  document.addEventListener('load', pedirAjuste, true);   // cada imagen que termina de cargar
  const galeria = document.querySelector('.gallery');
  if (galeria) new MutationObserver(pedirAjuste).observe(galeria, { childList: true });
  pedirAjuste();
})();

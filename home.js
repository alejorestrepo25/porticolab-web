// Inicio explorable: apariciones al hacer scroll, progreso, índice lateral, inclinación 3D, destello del hero,
// selector de materiales y botón para copiar el correo. Todo respeta prefers-reduced-motion.
(() => {
  const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;


  // Medimos navegación y banner para que la portada móvil nunca quede debajo de ellos.
  const medir = () => {
    const root = document.documentElement;
    const h = document.querySelector("header");
    const banner = document.querySelector(".wip-banner");
    if (h) root.style.setProperty("--hh", h.offsetHeight + "px");
    root.style.setProperty("--bh", banner && getComputedStyle(banner).display !== "none" ? banner.offsetHeight + "px" : "0px");
  };
  const altoEncabezado = () => (document.querySelector('header') || { offsetHeight: 0 }).offsetHeight;
  medir();
  addEventListener("resize", medir);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);
  new MutationObserver(medir).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  const banner = document.querySelector(".wip-banner");
  if (banner && "ResizeObserver" in window) new ResizeObserver(medir).observe(banner);

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
    puntos.forEach((p) => {
      p.classList.toggle('activo', p === activo);
      if (p === activo && matchMedia('(max-width: 1100px), (pointer: coarse)').matches) p.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  }
  const pedirMarca = () => { if (!marcando) marcando = setTimeout(marcar, 40); };
  if (pares.length) {
    addEventListener('scroll', pedirMarca, { passive: true });
    addEventListener('resize', pedirMarca);
    addEventListener('load', pedirMarca);
    marcar();
  }

  // Las tarjetas y fotografías quedan estables para dar prioridad a la lectura.

  const portada = document.querySelector('.y2k-hero');
  const etapasHero = [...document.querySelectorAll('[data-hero-step]')];
  const ubicarMascota = () => document.body.classList.toggle('hero-visible', scrollY < 40);
  addEventListener('scroll', ubicarMascota, { passive: true });
  addEventListener('resize', ubicarMascota);
  ubicarMascota();
  if (etapasHero.length > 1 && !reducir) {
    let etapa = 0;
    let reloj = 0;
    const avanzarEtapa = () => {
      if (document.hidden || !portada || portada.getBoundingClientRect().bottom <= 0 || portada.getBoundingClientRect().top >= innerHeight) return;
      etapasHero[etapa].classList.remove('is-activa');
      etapa = (etapa + 1) % etapasHero.length;
      etapasHero[etapa].classList.add('is-activa');
    };
    const iniciar = () => { if (!reloj) reloj = setInterval(avanzarEtapa, 2400); };
    const pausar = () => { clearInterval(reloj); reloj = 0; };
    document.addEventListener('visibilitychange', () => document.hidden ? pausar() : iniciar());
    iniciar();
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

  // Transición por pantallas: rueda/flechas avanzan una vista cada vez en escritorio.
  const modoPantallas = matchMedia('(min-width: 901px) and (min-height: 560px)');
  const listaPantallas = () => [...new Set([
    ...document.querySelectorAll('[data-pantalla]'),
    document.getElementById('inicio'),
    document.getElementById('frentes'),
    document.querySelector('.archivo-poster'),
    document.getElementById('proceso'),
    document.getElementById('contacto')
  ].filter(Boolean))].filter((el) => el.offsetParent !== null).sort((a, b) => topDe(a) - topDe(b));
  const topDe = (el) => el.getBoundingClientRect().top + scrollY - altoEncabezado();
  let bloqueado = false;
  function actual(lista) {
    const y = scrollY + 6;
    let i = 0;
    lista.forEach((el, n) => { if (topDe(el) <= y) i = n; });
    return i;
  }
  function irA(lista, i) {
    i = Math.max(0, Math.min(lista.length - 1, i));
    const destino = Math.max(0, Math.min(topDe(lista[i]), document.documentElement.scrollHeight - innerHeight));
    bloqueado = true;
    scrollTo({ top: destino, behavior: 'smooth' });
    setTimeout(() => { bloqueado = false; }, 760);
  }
  if (!reducir) {
    addEventListener('wheel', (e) => {
      if (!modoPantallas.matches || e.ctrlKey || Math.abs(e.deltaY) < 6) return;
      e.preventDefault();
      if (bloqueado) return;
      const lista = listaPantallas();
      if (lista.length) irA(lista, actual(lista) + (e.deltaY > 0 ? 1 : -1));
    }, { passive: false });
    addEventListener('keydown', (e) => {
      if (!modoPantallas.matches || e.altKey || e.ctrlKey || e.metaKey) return;
      if (/input|textarea|select/i.test((document.activeElement || {}).tagName || '')) return;
      const lista = listaPantallas();
      if (!lista.length) return;
      const k = e.key;
      if (k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey)) { e.preventDefault(); if (!bloqueado) irA(lista, actual(lista) + 1); }
      else if (k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey)) { e.preventDefault(); if (!bloqueado) irA(lista, actual(lista) - 1); }
      else if (k === 'Home') { e.preventDefault(); if (!bloqueado) irA(lista, 0); }
      else if (k === 'End') { e.preventDefault(); if (!bloqueado) irA(lista, lista.length - 1); }
    });
  }

  // Ajuste automático: ninguna pantalla se sale por abajo, sin importar el tamaño de la ventana ni del encabezado
  const contenedores = () => [...document.querySelectorAll('.y2k-hero, .seccion, .cierre-home, .archivo-poster')].filter((c) => !c.parentElement.classList.contains('archivo-poster'));
  function ajustar() {
    const conAjuste = matchMedia('(min-width: 901px) and (min-height: 560px)').matches;
    contenedores().forEach((c) => {
      c.style.removeProperty('--k');
      if (!conAjuste) return;
      const disponible = innerHeight - altoEncabezado();
      let k = 1;
      for (let i = 0; i < 4; i++) {
        const h = Math.max(c.getBoundingClientRect().height, c.scrollHeight);
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

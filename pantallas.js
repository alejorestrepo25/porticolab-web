// Paso entre pantallas en escritorio (Inicio, Nosotros, Servicios): un gesto de rueda o trackpad = una pantalla.
// - Espera a que termine el desplazamiento y a que el gesto se detenga (la inercia del trackpad no salta dos pantallas).
// - Si una pantalla es más alta que la ventana, primero se recorre normal hasta su borde y luego se pasa a la siguiente.
// - Se apaga en pantallas pequeñas, con Ctrl (zoom), dentro de campos de texto y mientras haya un formulario abierto.
(() => {
  const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const modo = matchMedia('(min-width: 901px) and (min-height: 560px)');
  const cab = () => document.querySelector('header');
  const alto = () => (cab() ? cab().getBoundingClientRect().height : 0);
  const margen = (el) => parseFloat(getComputedStyle(el).marginTop) || 0;
  const topDe = (el) => el.getBoundingClientRect().top + scrollY - alto() - margen(el);
  const lista = () => [...document.querySelectorAll('[data-pantalla]')]
    .filter((el) => el.offsetParent !== null)
    .sort((a, b) => topDe(a) - topDe(b));
  const actual = (l) => { const y = scrollY + 8; let i = 0; l.forEach((el, n) => { if (topDe(el) <= y) i = n; }); return i; };
  // En escritorio el ajuste nativo (scroll-snap) compite con este paso y desvía el destino: se apaga
  const snap = () => { document.documentElement.style.scrollSnapType = modo.matches ? 'none' : ''; };
  snap();
  modo.addEventListener('change', snap);
  const HOLGURA = 24;   // px que puede sobresalir una pantalla sin que cuente como "más alta que la ventana"

  let bloqueado = false, ultimoGesto = 0, acumulado = 0, reloj = 0;
  function liberarCuandoTermine(destino, el) {
    const inicio = performance.now();
    let previo = -1, quieto = 0, corregido = false;
    clearInterval(reloj);
    reloj = setInterval(() => {
      const y = scrollY, ahora = performance.now();
      quieto = Math.abs(y - previo) < 1 ? quieto + 1 : 0;
      previo = y;
      const llego = Math.abs(y - destino) < 2 || quieto >= 3;
      // Si algo cambió de tamaño durante el viaje (imágenes que cargan), se corrige una vez al llegar
      if (llego && el && !corregido) {
        corregido = true;
        const real = Math.round(Math.max(0, Math.min(topDe(el), document.documentElement.scrollHeight - innerHeight)));
        if (Math.abs(real - y) > 2) { destino = real; quieto = 0; scrollTo({ top: real, behavior: 'auto' }); return; }
      }
      const gestoTerminado = ahora - ultimoGesto > 180;
      if ((llego && gestoTerminado) || ahora - inicio > 1600) { clearInterval(reloj); bloqueado = false; acumulado = 0; }
    }, 40);
  }
  function irA(l, i) {
    i = Math.max(0, Math.min(l.length - 1, i));
    const destino = Math.round(Math.max(0, Math.min(topDe(l[i]), document.documentElement.scrollHeight - innerHeight)));
    if (Math.abs(destino - scrollY) < 2) return false;
    bloqueado = true;
    scrollTo({ top: destino, behavior: reducir ? 'auto' : 'smooth' });
    liberarCuandoTermine(destino, l[i]);
    return true;
  }
  // ¿La pantalla actual todavía tiene contenido por recorrer en esa dirección?
  function quedaPorRecorrer(el, dir) {
    const r = el.getBoundingClientRect();
    return dir > 0 ? r.bottom - innerHeight > HOLGURA : alto() - r.top > HOLGURA;
  }

  // Llegada a una pantalla por enlace (#contacto, desde otra página o un botón): queda completa bajo el encabezado.
  // Se repite cuando terminan de cargar fuentes e imágenes, porque el ajuste de tamaño de las pantallas mueve la posición.
  const pantallaDe = (id) => { const el = id && document.getElementById(id); return el ? (el.closest('[data-pantalla]') || el) : null; };
  const alinear = (el, suave) => scrollTo({ top: Math.round(Math.max(0, topDe(el))), behavior: suave && !reducir ? 'smooth' : 'auto' });
  function llegar() {
    const el = pantallaDe(decodeURIComponent(location.hash.slice(1)));
    if (el && Math.abs(scrollY - topDe(el)) < innerHeight) alinear(el, false);
  }
  if (location.hash) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    requestAnimationFrame(llegar);
    addEventListener('load', () => { llegar(); setTimeout(llegar, 300); setTimeout(llegar, 900); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(llegar, 60));
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
    const el = pantallaDe(a.getAttribute('href').slice(1));
    if (!el) return;
    e.preventDefault();
    history.replaceState(null, '', '#' + el.id);
    bloqueado = true;
    alinear(el, true);
    liberarCuandoTermine(Math.round(Math.max(0, Math.min(topDe(el), document.documentElement.scrollHeight - innerHeight))), el);
  });

  // Celular: cada pantalla mide exactamente lo que queda bajo el encabezado. Si su contenido no cabe,
  // se reduce lo justo (variable --km) para que se vea completo; el desplazamiento se ancla de pantalla en pantalla.
  const movil = matchMedia('(max-width: 900px)');
  function ajustarMovil() {
    const raiz = document.documentElement;
    raiz.style.setProperty('--hh', Math.round(alto()) + 'px');
    const secciones = [...document.querySelectorAll('[data-pantalla]')];
    secciones.forEach((c) => c.style.removeProperty('--km'));
    if (!movil.matches) return;
    const disponible = innerHeight - alto();
    // la pantalla tiene alto fijo: lo que sobra (también dentro de las tarjetas apiladas) queda como desborde medible
    // se mide contra el alto real de la hoja (100svh: con la barra del navegador visible), no contra innerHeight
    const sobra = (c) => c.scrollHeight - Math.min(disponible, c.clientHeight)
      + [...c.querySelectorAll('.frente')].reduce((m, t) => m + Math.max(0, t.scrollHeight - t.clientHeight), 0);
    secciones.forEach((c) => {
      if (sobra(c) <= 1) return;
      // búsqueda binaria de la mayor escala que cabe completa
      let lo = 0.6, hi = 1;
      for (let i = 0; i < 7; i++) {
        const k = (lo + hi) / 2;
        c.style.setProperty('--km', k.toFixed(3));
        if (sobra(c) <= 1) lo = k; else hi = k;
      }
      c.style.setProperty('--km', lo.toFixed(3));
    });
  }
  let reloj2 = 0;
  const pedirMovil = () => { clearTimeout(reloj2); reloj2 = setTimeout(ajustarMovil, 120); };
  addEventListener('resize', pedirMovil);
  addEventListener('load', pedirMovil);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pedirMovil);
  document.addEventListener('load', pedirMovil, true);
  movil.addEventListener('change', pedirMovil);
  pedirMovil();

  addEventListener('wheel', (e) => {
    if (!modo.matches || e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
    const ahora = performance.now();
    const pausaEntreGestos = ahora - ultimoGesto;
    ultimoGesto = ahora;
    if (bloqueado) { e.preventDefault(); return; }
    const l = lista();
    if (!l.length) return;
    const dir = e.deltaY > 0 ? 1 : -1;
    const i = actual(l);
    if (quedaPorRecorrer(l[i], dir)) {
      // Desplazamiento normal dentro de una pantalla alta, sin pasarse de su borde
      const r = l[i].getBoundingClientRect();
      const resto = dir > 0 ? r.bottom - innerHeight : alto() - r.top;
      const paso = Math.abs(e.deltaY) * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
      if (paso < resto) return;
      e.preventDefault();
      bloqueado = true;
      const destino = Math.round(scrollY + dir * resto);
      scrollTo({ top: destino, behavior: 'auto' });
      liberarCuandoTermine(destino, null);
      return;
    }
    e.preventDefault();
    if (pausaEntreGestos > 220) acumulado = 0;
    acumulado += e.deltaY;
    if (Math.abs(acumulado) < 28) return;      // toques mínimos del trackpad no cambian de pantalla
    acumulado = 0;
    irA(l, i + dir);
  }, { passive: false });

  addEventListener('keydown', (e) => {
    if (!modo.matches || e.altKey || e.ctrlKey || e.metaKey) return;
    if (/input|textarea|select/i.test((document.activeElement || {}).tagName || '')) return;
    const k = e.key;
    const dir = (k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey)) ? 1
      : (k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey)) ? -1 : 0;
    const l = lista();
    if (!l.length) return;
    if (k === 'Home' || k === 'End') { e.preventDefault(); if (!bloqueado) irA(l, k === 'Home' ? 0 : l.length - 1); return; }
    if (!dir) return;
    const i = actual(l);
    if (quedaPorRecorrer(l[i], dir)) return;
    e.preventDefault();
    if (!bloqueado) irA(l, i + dir);
  });

  // Celular: puntos bajo cada carrusel de tarjetas (una tarjeta completa por vista)
  function puntos(car) {
    let fila = car.nextElementSibling;
    if (!fila || !fila.classList.contains('carrusel-puntos')) {
      fila = document.createElement('div');
      fila.className = 'carrusel-puntos';
      fila.setAttribute('aria-hidden', 'true');
      car.after(fila);
      car.addEventListener('scroll', () => marcar(car, fila), { passive: true });
    }
    const n = car.children.length;
    if (fila.children.length !== n) fila.replaceChildren(...Array.from({ length: n }, () => document.createElement('i')));
    marcar(car, fila);
  }
  function marcar(car, fila) {
    const paso = car.children[1] ? car.children[1].offsetLeft - car.children[0].offsetLeft : car.clientWidth;
    const i = Math.round(car.scrollLeft / Math.max(1, paso));
    [...fila.children].forEach((p, j) => p.classList.toggle('activo', j === i));
  }
  function carruseles() {
    document.querySelectorAll('.frentes, .piezas').forEach((car) => {
      if (car.children.length > 1) puntos(car);
      if (!car.dataset.puntosObs) { car.dataset.puntosObs = '1'; new MutationObserver(() => puntos(car)).observe(car, { childList: true }); }
    });
  }
  carruseles();
  addEventListener('load', carruseles);
})();

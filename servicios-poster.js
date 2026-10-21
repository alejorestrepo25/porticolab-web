// Servicios en pantallas: un giro de la rueda (o una flecha) baja rápido hasta la siguiente vista.
// Se apaga mientras el formulario de cotización o la confirmación estén abiertos, y en pantallas pequeñas.
(() => {
  const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const modo = matchMedia('(min-width: 901px) and (min-height: 560px)');
  const cab = document.querySelector('header');
  const alto = () => (cab ? cab.offsetHeight : 0);
  const medir = () => document.documentElement.style.setProperty('--hh', alto() + 'px');
  medir();
  addEventListener('resize', medir);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);

  const formularioAbierto = () => ['cotizador', 'confirmacion'].some((id) => { const e = document.getElementById(id); return e && e.classList.contains('visible'); });
  const pantallas = () => [...document.querySelectorAll('[data-pantalla]')].filter((e) => e.offsetParent !== null).sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  const margenArriba = (el) => parseFloat(getComputedStyle(el).marginTop) || 0;
  const topDe = (el) => el.getBoundingClientRect().top + scrollY - alto() - margenArriba(el);

  // Índice lateral
  const rail = document.createElement('nav');
  rail.className = 'rail';
  rail.setAttribute('aria-label', 'Secciones');
  document.querySelectorAll('[data-pantalla]').forEach((el) => {
    const a = document.createElement('a');
    a.href = '#' + (el.id || '');
    a.innerHTML = '<span>' + (el.dataset.nombre || '') + '</span>';
    a.addEventListener('click', (e) => {
      if (!modo.matches || formularioAbierto() || !el.offsetParent) return;
      e.preventDefault();
      scrollTo({ top: Math.max(0, topDe(el)), behavior: reducir ? 'auto' : 'smooth' });
    });
    a._el = el;
    rail.appendChild(a);
  });
  document.body.appendChild(rail);
  let marcando = 0;
  function marcar() {
    marcando = 0;
    const mitad = innerHeight / 2;
    [...rail.children].forEach((a) => {
      const el = a._el;
      const visible = el.offsetParent !== null;
      a.style.display = visible ? '' : 'none';
      const r = el.getBoundingClientRect();
      const activo = visible && r.top <= mitad && r.bottom > mitad;
      a.classList.toggle('activo', activo);
      if (activo && matchMedia('(max-width: 1100px), (pointer: coarse)').matches) a.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
  }
  const pedirMarca = () => { if (!marcando) marcando = setTimeout(marcar, 40); };
  addEventListener('scroll', pedirMarca, { passive: true });
  addEventListener('resize', pedirMarca);
  addEventListener('load', pedirMarca);
  marcar();

  // Scroll nativo para lectura libre; los puntos laterales conservan navegación directa.

  // Ajuste automático: si el contenido de una pantalla no cabe, se reduce hasta que quepa
  function ajustar() {
    pantallas().forEach((c) => {
      c.style.removeProperty('--k');
      if (!modo.matches) return;
      const cs = getComputedStyle(c);
      const extra = (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0);
      const disponible = innerHeight - alto();
      let k = 1;
      for (let i = 0; i < 4; i++) {
        const h = c.getBoundingClientRect().height + extra;
        if (h <= disponible + 1) break;
        k = Math.max(0.5, k * (disponible / h) * 0.985);
        c.style.setProperty('--k', k.toFixed(3));
      }
    });
  }
  let pendiente = 0;
  const pedirAjuste = () => { clearTimeout(pendiente); pendiente = setTimeout(ajustar, 140); };
  addEventListener('resize', pedirAjuste);
  addEventListener('load', pedirAjuste);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pedirAjuste);
  document.addEventListener('load', pedirAjuste, true);
  const grid = document.getElementById('srv-grid');
  if (grid) new MutationObserver(pedirAjuste).observe(grid, { childList: true });
  pedirAjuste();
})();

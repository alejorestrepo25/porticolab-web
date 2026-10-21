// Movimiento de Servicios y Nosotros: marca como "visto" cada elemento cuando llega a pantalla y numera los grupos para escalonar.
// Si el usuario pidió menos movimiento, o el navegador no soporta IntersectionObserver, todo queda visible sin animar.
(() => {
  const root = document.documentElement;
  const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducir || !('IntersectionObserver' in window)) return;   // sin la clase mov-ok no hay estados ocultos
  root.classList.add('mov-ok');

  const visto = (el) => el.classList.add('visto');
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { visto(e.target); io.unobserve(e.target); }
  }), { threshold: 0.22, rootMargin: '0px 0px -6% 0px' });

  // Servicios: los grupos de tarjetas se escalonan según su posición (--i); las barras de costo del SVG BIM, según la suya (--b)
  const grupos = ['.pasos-row', '.ruta-row', '#srv-grid'];
  function preparar(el) {
    if (el.dataset.mov) return;
    el.dataset.mov = '1';
    const padre = el.parentElement;
    if (padre) el.style.setProperty('--i', [...padre.children].filter((c) => c.matches('.paso-card, .srv-card')).indexOf(el));
    el.querySelectorAll('svg rect[rx]').forEach((r, k) => { r.classList.add('mov-barra'); r.style.setProperty('--b', k); });
    io.observe(el);
  }
  const buscar = () => document.querySelectorAll(grupos.map((g) => g + ' > .paso-card, ' + g + ' > .srv-card').join(',')).forEach(preparar);
  buscar();
  const rejilla = document.getElementById('srv-grid');
  if (rejilla) new MutationObserver(buscar).observe(rejilla, { childList: true });

  // Nosotros: reutiliza .rev/.visto de home.js (pilares, piezas, encabezados). Si esa clase no se añade, se observan aquí por seguridad.
  document.querySelectorAll('body.nosotros .n-pilar, body.nosotros .pieza').forEach((el) => { if (!el.classList.contains('visto')) io.observe(el); });
})();

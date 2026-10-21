// Movimiento de Servicios y Nosotros: marca como "visto" cada elemento cuando llega a pantalla, numera los grupos para escalonar
// y da una inclinación 3D suave a las tarjetas con puntero. Con "reducir movimiento" (o sin IntersectionObserver) todo queda visible sin animar.
(() => {
  const root = document.documentElement;
  const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducir || !('IntersectionObserver' in window)) return;   // sin la clase mov-ok no hay estados ocultos
  root.classList.add('mov-ok');

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });

  // Servicios: los grupos de tarjetas se escalonan según su posición (--i); las barras de costo del SVG BIM, según la suya (--b)
  const grupos = ['.pasos-row', '.ruta-row', '#srv-grid'];
  function preparar(el) {
    if (el.dataset.mov) return;
    el.dataset.mov = '1';
    const padre = el.parentElement;
    if (padre) el.style.setProperty('--i', [...padre.children].filter((c) => c.matches('.paso-card, .srv-card')).indexOf(el));
    el.querySelectorAll('svg rect[rx]').forEach((r, k) => { r.classList.add('mov-barra'); r.style.setProperty('--b', k); });
    io.observe(el);
    inclinar(el);
  }
  const buscar = () => document.querySelectorAll(grupos.map((g) => g + ' > .paso-card, ' + g + ' > .srv-card').join(',')).forEach(preparar);

  // Inclinación 3D (solo con mouse): máximo 4,5°, vuelve suave al salir
  const conMouse = matchMedia('(hover: hover) and (pointer: fine)').matches;
  function inclinar(el) {
    if (!conMouse || el.dataset.tilt) return;
    el.dataset.tilt = '1';
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg');
      el.style.setProperty('--rx', (-y * 9).toFixed(2) + 'deg');
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  }

  buscar();
  const rejilla = document.getElementById('srv-grid');
  if (rejilla) new MutationObserver(buscar).observe(rejilla, { childList: true });

  // Nosotros: pilares, piezas y ejes. Reutiliza .visto de home.js si ya lo puso; si no, se observan aquí.
  document.querySelectorAll('body.nosotros .n-pilar, body.nosotros .pieza, body.nosotros .ejes').forEach((el) => {
    if (!el.classList.contains('visto')) io.observe(el);
    if (el.matches('.pieza')) inclinar(el);
  });
})();

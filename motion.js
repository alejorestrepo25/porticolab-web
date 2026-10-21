// Movimiento de Servicios y Nosotros: revela contenido al entrar en pantalla, con una transición corta y discreta.
// Con "reducir movimiento" (o sin IntersectionObserver) todo queda visible sin animar.
(() => {
  const root = document.documentElement;
  const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducir || !('IntersectionObserver' in window)) return;   // sin la clase mov-ok no hay estados ocultos
  root.classList.add('mov-ok');

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });

  // Servicios: los grupos entran con un escalonado breve.
  const grupos = ['.pasos-row', '.ruta-row', '#srv-grid'];
  function preparar(el) {
    if (el.dataset.mov) return;
    el.dataset.mov = '1';
    const padre = el.parentElement;
    if (padre) el.style.setProperty('--i', [...padre.children].filter((c) => c.matches('.paso-card, .srv-card')).indexOf(el));
    io.observe(el);
  }
  const buscar = () => document.querySelectorAll(grupos.map((g) => g + ' > .paso-card, ' + g + ' > .srv-card').join(',')).forEach(preparar);

  buscar();
  const rejilla = document.getElementById('srv-grid');
  if (rejilla) new MutationObserver(buscar).observe(rejilla, { childList: true });

  // Nosotros: pilares, piezas y ejes. Reutiliza .visto de home.js si ya lo puso; si no, se observan aquí.
  document.querySelectorAll('body.nosotros .n-pilar, body.nosotros .pieza, body.nosotros .ejes').forEach((el) => {
    if (!el.classList.contains('visto')) io.observe(el);
  });
})();

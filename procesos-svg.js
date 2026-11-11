// Las secuencias del portafolio se detienen cuando quedan fuera de vista o la pestaña está oculta.
(() => {
  const figuras = [...document.querySelectorAll('object[data-proceso]')];
  if (!figuras.length || !('IntersectionObserver' in window)) return;

  // El SVG no ve el tema de la página: se lo pasamos con la clase .tema-claro
  const tema = (obj) => {
    const root = obj.contentDocument?.documentElement;
    if (root) root.classList.toggle('tema-claro', document.documentElement.dataset.theme === 'light');
  };

  const actualizar = (obj) => {
    const root = obj.contentDocument?.documentElement;
    if (!root) return;
    tema(obj);
    const pausa = document.hidden || obj.dataset.enVista !== 'true';
    root.classList.toggle('en-pausa', pausa);
    if (!pausa) requestAnimationFrame(() => sincronizar(obj));
  };

  // Las tres piezas duran lo mismo (9 s) y van al mismo compás: cada ciclo se alinea con el reloj
  const CICLO = 9000;
  const sincronizar = (obj) => {
    const doc = obj.contentDocument;
    if (!doc || !doc.getAnimations) return;
    const t = Date.now() % CICLO;
    doc.getAnimations().forEach((a) => { try { a.currentTime = t; } catch (e) { /* sin efecto */ } });
  };

  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach(({ target, isIntersecting }) => {
      target.dataset.enVista = String(isIntersecting);
      actualizar(target);
    });
  }, { threshold: 0.08, rootMargin: '80px 0px' });

  figuras.forEach((obj) => {
    obj.dataset.enVista = 'false';
    obj.addEventListener('load', () => actualizar(obj));
    observer.observe(obj);
  });
  document.addEventListener('visibilitychange', () => figuras.forEach(actualizar));
  new MutationObserver(() => figuras.forEach(tema)).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();

// Las secuencias del portafolio se detienen cuando quedan fuera de vista o la pestaña está oculta.
(() => {
  const figuras = [...document.querySelectorAll('object[data-proceso]')];
  if (!figuras.length || !('IntersectionObserver' in window)) return;

  const actualizar = (obj) => {
    const root = obj.contentDocument?.documentElement;
    if (!root) return;
    root.classList.toggle('en-pausa', document.hidden || obj.dataset.enVista !== 'true');
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
})();

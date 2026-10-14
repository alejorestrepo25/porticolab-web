// Nosotros: puntos del mapa del taller. Al tocarlos (o pasar el puntero) muestran qué hay en ese rincón;
// al principio van recorriéndose solos hasta que el visitante elige uno.
(() => {
  const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pines = [...document.querySelectorAll('.pin')];
  const info = document.querySelector('.mapa__info');
  if (!pines.length || !info) return;

  const mostrar = (p) => {
    pines.forEach((x) => x.classList.toggle('activo', x === p));
    info.innerHTML = '';
    const t = document.createElement('b'); t.textContent = p.dataset.titulo;
    const d = document.createElement('span'); d.textContent = p.dataset.texto;
    info.appendChild(t); info.appendChild(d);
  };

  let eligio = false, auto = null, k = -1;
  const elegir = (p) => { eligio = true; clearInterval(auto); mostrar(p); };
  pines.forEach((p) => {
    p.addEventListener('click', () => elegir(p));
    p.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover)').matches) elegir(p); });
    p.addEventListener('focus', () => elegir(p));
  });

  if (!reducir && 'IntersectionObserver' in window) {
    const visto = new IntersectionObserver((es) => {
      if (!es[0].isIntersecting || auto || eligio) return;
      auto = setInterval(() => {
        if (eligio || document.hidden) return;
        k = (k + 1) % pines.length;
        mostrar(pines[k]);
      }, 3200);
    }, { threshold: 0.5 });
    visto.observe(document.querySelector('.mapa'));
  }
})();

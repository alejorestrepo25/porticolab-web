(() => {
  const path = (value) => {
    const url = new URL(value, location.href);
    return url.pathname.replace(/\/+$/, '') || '/';
  };
  const current = path(location.href);
  const logo = document.querySelector('header .logo[href]');
  if (logo && (current === '/' || current.endsWith('/index.html'))) logo.setAttribute('aria-current', 'page');
  const links = [...document.querySelectorAll('header .nav a[href]')];
  let active = null;

  for (const link of links) {
    link.removeAttribute('aria-current');
    link.classList.remove('activo');
    if (path(link.href) === current) active = link;
  }

  if (!active) return;
  active.setAttribute('aria-current', 'page');
  active.classList.add('activo');

  const nav = active.closest('.nav');
  if (nav && matchMedia('(max-width: 768px)').matches) {
    const left = active.offsetLeft - (nav.clientWidth - active.clientWidth) / 2;
    nav.scrollLeft = Math.max(0, left);
  }
})();

// Flechas de acción: la "→" final de enlaces y botones se envuelve para animarla al pasar el cursor
(() => {
  const marcar = (raiz) => raiz.querySelectorAll('a, button').forEach((el) => {
    if (el.querySelector('.flecha-accion')) return;
    const nodos = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
    const ultimo = nodos[nodos.length - 1];
    if (!ultimo || !/→\s*$/.test(ultimo.textContent)) return;
    const txt = ultimo.textContent.replace(/\s*→\s*$/, '');
    const flecha = document.createElement('span');
    flecha.className = 'flecha-accion';
    flecha.setAttribute('aria-hidden', 'true');
    flecha.textContent = '→';
    ultimo.textContent = txt + ' ';
    ultimo.after(flecha);
  });
  marcar(document);
  new MutationObserver((cambios) => cambios.forEach((c) => c.addedNodes.forEach((n) => { if (n.nodeType === 1) marcar(n.parentNode || n); }))).observe(document.body, { childList: true, subtree: true });
})();

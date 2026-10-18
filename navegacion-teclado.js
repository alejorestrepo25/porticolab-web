// Flechas horizontales: cambia entre las secciones del sitio desde páginas con menú principal.
(() => {
  let paginaActual = new URL(location.href).pathname;
  if (paginaActual.endsWith('/')) paginaActual += 'index.html';
  if (/\/publicaciones\/post\.html$/.test(paginaActual)) paginaActual = paginaActual.replace(/\/publicaciones\/post\.html$/, '/laboratorio.html');
  else if (/\/carrito\.html$/.test(paginaActual)) paginaActual = paginaActual.replace(/\/carrito\.html$/, '/servicios.html');
  else if (/\/404\.html$/.test(paginaActual)) paginaActual = paginaActual.replace(/\/404\.html$/, '/index.html');

  document.querySelectorAll('header .logo[href], header .nav a[href]').forEach((a) => {
    try {
      if (new URL(a.href, location.href).pathname === paginaActual) a.setAttribute('aria-current', 'page');
    } catch { /* Ignora enlaces no válidos. */ }
  });

  const enlaces = [
    ...document.querySelectorAll('header .logo[href], header .nav a[href]')
  ].filter((a) => {
    try {
      const u = new URL(a.href, location.href);
      return u.origin === location.origin && /\/(index|laboratorio|servicios|inspiracion|nosotros)\.html$/.test(u.pathname);
    } catch { return false; }
  });

  const destinos = [...new Map(enlaces.map((a) => {
    const u = new URL(a.href, location.href);
    return [u.pathname, u.href];
  })).values()];
  if (destinos.length < 2) return;

  addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key) || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const el = e.target;
    if (el?.matches('input, textarea, select, [contenteditable="true"], [role="textbox"]')) return;
    if (document.querySelector('[role="dialog"]:not([hidden]), dialog[open]')) return;
    if (getSelection()?.toString()) return;

    let current = new URL(location.href).pathname;
    if (/\/publicaciones\/post\.html$/.test(current)) current = current.replace(/\/publicaciones\/post\.html$/, '/laboratorio.html');
    else if (/\/carrito\.html$/.test(current)) current = current.replace(/\/carrito\.html$/, '/servicios.html');
    else if (/\/404\.html$/.test(current)) current = current.replace(/\/404\.html$/, '/index.html');
    const index = destinos.findIndex((href) => new URL(href).pathname === current);
    if (index < 0) return;
    const step = e.key === 'ArrowRight' ? 1 : -1;
    const next = (index + step + destinos.length) % destinos.length;
    e.preventDefault();
    location.href = destinos[next];
  });
})();

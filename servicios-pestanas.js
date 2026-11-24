// Servicios en pestañas (Inicio y Servicios): una tarjeta a la vez.
// ?servicio=auditor|bim|maquetas abre esa pestaña. Flechas izquierda/derecha cambian de pestaña.
(() => {
  document.querySelectorAll('.pestanas[role="tablist"]').forEach((lista) => {
    const frentes = lista.nextElementSibling;
    if (!frentes || !frentes.classList.contains('frentes')) return;
    const pestanas = [...lista.querySelectorAll('[role="tab"]')];
    frentes.classList.add('frentes--pestanas');
    function mostrar(p, foco) {
      pestanas.forEach((t) => {
        const activa = t === p;
        t.setAttribute('aria-selected', activa ? 'true' : 'false');
        t.tabIndex = activa ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) {
          panel.hidden = !activa;
          // en el Inicio las tarjetas aparecen con un fundido (.rev → .visto) que no corre si estaban ocultas
          if (activa && panel.classList.contains('rev')) panel.classList.add('visto');
        }
      });
      if (foco) p.focus();
      lista.scrollLeft = Math.max(0, p.offsetLeft - 16);   // en celular la barra se desliza hasta la pestaña, sin mover la página
      dispatchEvent(new Event('resize'));   // pantallas.js vuelve a ajustar la escala en celular
    }
    pestanas.forEach((t, i) => {
      t.addEventListener('click', () => mostrar(t));
      t.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        mostrar(pestanas[(i + d + pestanas.length) % pestanas.length], true);
      });
    });
    const pedido = new URLSearchParams(location.search).get('servicio');
    mostrar(pestanas.find((t) => t.dataset.servicio === pedido) || pestanas[0]);
  });
})();

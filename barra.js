// Barra amarilla "Sitio en desarrollo": se muestra u oculta desde Sanity.
// Interruptor: documento "INTERRUPTOR · Barra amarilla" (slug barra-sitio), casilla "Disponible para venta".
//   Marcada + Publicar  = la barra se muestra.   Desmarcada + Publicar = la barra se oculta.
// Sin respuesta de Sanity la barra queda como estaba la última vez (o oculta en la primera visita).
(() => {
  const raiz = document.documentElement;
  const CLAVE = 'pl_barra';
  try { if (localStorage.getItem(CLAVE) === '1') raiz.classList.add('barra-activa'); } catch (e) { /* sin almacenamiento */ }

  const consulta = encodeURIComponent('*[_type == "proyecto" && slug.current == "barra-sitio"][0].disponible');
  fetch('https://32sykluw.api.sanity.io/v2024-01-01/data/query/production?query=' + consulta)
    .then(r => r.json())
    .then(({ result }) => {
      const activa = result === true;
      raiz.classList.toggle('barra-activa', activa);
      try { localStorage.setItem(CLAVE, activa ? '1' : '0'); } catch (e) { /* sin almacenamiento */ }
    })
    .catch(() => { /* se queda con el último estado conocido */ });
})();

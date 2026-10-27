// Acceso a Sanity compartido por todas las páginas.
// - Usa la CDN de Sanity (apicdn): respuestas en caché, sin límite práctico ante mucho tráfico.
// - Tiempo límite y verificación de respuesta: si Sanity falla, la página muestra su aviso en vez de quedarse cargando.
// - El texto que viene de Sanity nunca se inserta como HTML; las imágenes solo se aceptan con referencias válidas.
(() => {
  const PROYECTO = '32sykluw';
  const DATASET = 'production';
  const VERSION = '2024-01-01';
  const TIEMPO_LIMITE = 9000;

  async function consultar(groq, params = {}) {
    const qs = new URLSearchParams({ query: groq });
    Object.entries(params).forEach(([k, v]) => qs.set('$' + k, JSON.stringify(v)));
    const url = `https://${PROYECTO}.apicdn.sanity.io/v${VERSION}/data/query/${DATASET}?${qs}`;
    const control = new AbortController();
    const reloj = setTimeout(() => control.abort(), TIEMPO_LIMITE);
    try {
      const res = await fetch(url, { signal: control.signal });
      if (!res.ok) throw new Error(`Sanity respondió ${res.status}`);
      const json = await res.json();
      return json.result;
    } finally {
      clearTimeout(reloj);
    }
  }

  // Referencia de imagen de Sanity: image-<id>-<ancho>x<alto>-<formato>
  const REF = /^image-([a-zA-Z0-9]+)-(\d+)x(\d+)-([a-z0-9]+)$/;

  function imagen(ref, ancho = 800) {
    const m = typeof ref === 'string' && ref.match(REF);
    if (!m) return null;
    const [, id, w, h, formato] = m;
    return {
      url: `https://cdn.sanity.io/images/${PROYECTO}/${DATASET}/${id}-${w}x${h}.${formato}?w=${ancho}&fit=max&auto=format`,
      ancho: Number(w),
      alto: Number(h)
    };
  }

  const texto = v => (typeof v === 'string' ? v.trim() : '');
  const lista = v => (Array.isArray(v) ? v.filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()) : []);

  // Tarjeta de proyecto para las galerías, construida con nodos (sin innerHTML)
  function tarjeta(p, { codigo = '', prefijo = '', ancho = 800 } = {}) {
    const img = imagen(p?.portada?.asset?._ref, ancho);
    const titulo = texto(p?.title);
    if (!img || !titulo || typeof p._id !== 'string') return null;

    const item = document.createElement('div');
    item.className = 'gallery-item';
    const etiquetas = lista(p.tags);
    item.dataset.tags = etiquetas.join(',');

    const a = document.createElement('a');
    a.href = `${prefijo}publicaciones/post.html?id=${encodeURIComponent(p._id)}`;
    if (codigo) a.dataset.codigo = codigo;

    const im = document.createElement('img');
    im.src = img.url;
    im.alt = titulo;
    im.width = img.ancho;
    im.height = img.alto;
    im.loading = 'lazy';
    im.decoding = 'async';
    im.addEventListener('error', () => item.remove());
    a.appendChild(im);

    const h3 = document.createElement('h3');
    h3.textContent = titulo;

    const tags = document.createElement('div');
    tags.className = 'post-tags';
    etiquetas.filter(t => t !== 'laboratorio' && t !== 'inspiracion').slice(0, 2).forEach(t => {
      const s = document.createElement('span');
      s.textContent = t.replace(/-/g, ' ');
      tags.appendChild(s);
    });

    item.append(a, h3, tags);
    return item;
  }

  // Aviso en la galería cuando no hay datos (texto fijo, sin contenido externo)
  function aviso(contenedor, mensaje, conInstagram = false) {
    contenedor.textContent = '';
    const div = document.createElement('div');
    div.className = 'galeria-aviso';
    div.style.cssText = 'grid-column:1/-1;column-span:all;text-align:center;padding:60px 16px;font-size:15px';
    div.append(mensaje);
    if (conInstagram) {
      div.append(' Mira el trabajo reciente en ');
      const a = document.createElement('a');
      a.href = 'https://www.instagram.com/portico_lab/';
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Instagram';
      div.append(a, '.');
    }
    contenedor.appendChild(div);
  }

  window.PL_SANITY = { consultar, imagen, texto, lista, tarjeta, aviso };
})();

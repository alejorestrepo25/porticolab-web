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

  // Varias resoluciones de la misma imagen: el navegador baja solo la que necesita su pantalla
  function srcset(ref, anchos = [400, 700, 1000, 1400]) {
    const base = imagen(ref);
    if (!base) return '';
    return anchos.filter(a => a <= base.ancho * 1.2).map(a => `${imagen(ref, a).url} ${a}w`).join(', ');
  }

  const texto = v => (typeof v === 'string' ? v.trim() : '');
  const lista = v => (Array.isArray(v) ? v.filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()) : []);

  // Códigos de proyecto: los mismos de las carpetas locales
  const CODIGOS = [
    ['atalaya', 'A0000000013'], ['tangara', 'M0000000006'], ['dorica', 'P0000000004'],
    ['jersey', 'P0000000003'], ['bridge box', 'E0000000001'], ['coltejer', 'P0000000002'],
    ['skull', 'P0000000007'], ['moai', 'M0000000005'], ['san german', 'A0000000009'], ['zarcillo', 'P0000000006']
  ];
  const normal = v => texto(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  function codigo(titulo) {
    const t = normal(titulo);
    const par = CODIGOS.find(([k]) => t.startsWith(k) || t.includes(k));
    return par ? par[1] : '';
  }

  // Categoría legible a partir de las etiquetas: "Concreto / Diseño"
  const NOMBRES = { diseno: 'Diseño', arquitectura: 'Arquitectura', moderno: 'Moderno', concreto: 'Concreto', bambu: 'Bambú' };
  function categoria(tags) {
    return lista(tags)
      .filter(t => t !== 'laboratorio' && t !== 'inspiracion')
      .slice(0, 2)
      .map(t => NOMBRES[normal(t)] || (t.charAt(0).toUpperCase() + t.slice(1)).replace(/-/g, ' '))
      .join(' / ');
  }

  // Tarjeta de proyecto para las galerías, estilo catálogo, construida con nodos (sin innerHTML)
  function tarjeta(p, { prefijo = '', ancho = 800 } = {}) {
    const img = imagen(p?.portada?.asset?._ref, ancho);
    const titulo = texto(p?.title);
    if (!img || !titulo || typeof p._id !== 'string') return null;

    const item = document.createElement('div');
    item.className = 'gallery-item';
    const etiquetas = lista(p.tags);
    item.dataset.tags = etiquetas.join(',');

    const a = document.createElement('a');
    a.href = `${prefijo}publicaciones/post.html?id=${encodeURIComponent(p._id)}`;
    a.setAttribute('aria-label', titulo);

    const im = document.createElement('img');
    im.src = img.url;
    const juego = srcset(p.portada.asset._ref);
    if (juego) { im.srcset = juego; im.sizes = '(max-width: 900px) 50vw, 25vw'; }
    im.alt = titulo;
    im.width = img.ancho;
    im.height = img.alto;
    im.loading = 'lazy';
    im.decoding = 'async';
    im.addEventListener('error', () => item.remove());
    a.appendChild(im);

    // Código de carpeta en la parte inferior de la imagen
    const cod = codigo(titulo);
    if (cod) {
      const c = document.createElement('span');
      c.className = 'cat__cod';
      c.textContent = cod;
      a.appendChild(c);
    }

    // Línea morada y debajo "Título | descripción"
    const pie = document.createElement('div');
    pie.className = 'cat';
    const h3 = document.createElement('h3');
    const b = document.createElement('b');
    b.textContent = titulo;
    h3.appendChild(b);
    const rasgo = lista(p.features)[0];
    if (rasgo) {
      const sep = document.createElement('i');
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = '|';
      const d = document.createElement('span');
      d.textContent = rasgo;
      h3.append(' ', sep, ' ', d);
    }
    pie.appendChild(h3);

    item.append(a, pie);
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
      div.append(' Vea el trabajo reciente en ');
      const a = document.createElement('a');
      a.href = 'https://www.instagram.com/portico_lab/';
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Instagram';
      div.append(a, '.');
    }
    contenedor.appendChild(div);
  }

  window.PL_SANITY = { consultar, imagen, srcset, texto, lista, tarjeta, aviso, codigo, categoria };
})();

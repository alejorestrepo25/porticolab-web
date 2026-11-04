// Acceso a Sanity compartido por todas las páginas.
// - Usa la CDN de Sanity (apicdn): respuestas en caché, sin límite práctico ante mucho tráfico.
// - Tiempo límite y verificación de respuesta: si Sanity falla, la página muestra su aviso en vez de quedarse cargando.
// - El texto que viene de Sanity nunca se inserta como HTML; las imágenes solo se aceptan con referencias válidas.
(() => {
  const PROYECTO = '32sykluw';
  const DATASET = 'production';
  const VERSION = '2024-01-01';
  const TIEMPO_LIMITE = 9000;
  const CACHE_RECIENTE_MS = 2 * 60 * 1000;
  const CACHE_MAX_MS = 7 * 24 * 60 * 60 * 1000;
  const consultasEnCurso = new Map();

  function claveConsulta(groq, params) {
    const entrada = JSON.stringify([groq, Object.keys(params).sort().map(k => [k, params[k]])]);
    let hash = 2166136261;
    for (let i = 0; i < entrada.length; i++) hash = Math.imul(hash ^ entrada.charCodeAt(i), 16777619);
    return `pl:sanity:v2:${(hash >>> 0).toString(36)}`;
  }

  function leerCache(clave) {
    try {
      const dato = JSON.parse(localStorage.getItem(clave) || 'null');
      return dato && Date.now() - dato.fecha < CACHE_MAX_MS ? dato : null;
    } catch { return null; }
  }

  function guardarCache(clave, resultado) {
    try { localStorage.setItem(clave, JSON.stringify({ fecha: Date.now(), resultado })); } catch { /* El sitio sigue funcionando sin almacenamiento local. */ }
  }

  function consultarRed(groq, params, clave) {
    if (consultasEnCurso.has(clave)) return consultasEnCurso.get(clave);
    const peticion = (async () => {
      const qs = new URLSearchParams({ query: groq });
      Object.entries(params).forEach(([k, v]) => qs.set('$' + k, JSON.stringify(v)));
      const url = `https://${PROYECTO}.apicdn.sanity.io/v${VERSION}/data/query/${DATASET}?${qs}`;
      const control = new AbortController();
      const reloj = setTimeout(() => control.abort(), TIEMPO_LIMITE);
      try {
        const res = await fetch(url, { signal: control.signal });
        if (!res.ok) throw new Error(`Sanity respondió ${res.status}`);
        const json = await res.json();
        guardarCache(clave, json.result);
        return json.result;
      } finally {
        clearTimeout(reloj);
        consultasEnCurso.delete(clave);
      }
    })();
    consultasEnCurso.set(clave, peticion);
    return peticion;
  }

  async function consultar(groq, params = {}) {
    const clave = claveConsulta(groq, params);
    const cache = leerCache(clave);
    // Copia reciente (2 min): se usa tal cual. Si es más vieja se pide el contenido actual,
    // así una imagen cambiada en Sanity se ve de inmediato; la copia guardada solo cubre fallas de red.
    if (cache && Date.now() - cache.fecha < CACHE_RECIENTE_MS) return cache.resultado;
    try {
      return await consultarRed(groq, params, clave);
    } catch (e) {
      if (cache) return cache.resultado;
      throw e;
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

  // Nombre de la ficha fija de un proyecto: el mismo criterio que scripts/generar-fichas.mjs
  function nombreFicha(titulo) {
    return String(titulo || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  }

  const texto = v => (typeof v === 'string' ? v.trim() : '');
  const lista = v => (Array.isArray(v) ? v.filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()) : []);

  // Códigos de proyecto: los mismos de las carpetas locales
  // Códigos de las publicaciones (Excel «publicaciones-portico-lab»). Se aceptan títulos actuales y anteriores.
  const CODIGOS = [
    ['piel tejida', 'A-013'], ['edificio san german', 'A-009'], ['edif san german', 'A-009'], ['atalaya', 'A-013'],
    ['astra', 'A-001'], ['girder box', 'E-001'], ['bridge box', 'E-001'],
    ['cenit', 'M-004'], ['moai', 'M-005'], ['tangara', 'M-006'],
    ['coltejer', 'P-002'], ['jersey', 'P-003'], ['dorica', 'P-004'], ['zarcillo', 'P-006'], ['skull', 'P-007']
  ];
  const normal = v => texto(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Subtítulo corto de cada publicación (Excel «publicaciones-portico-lab», columna junto al nombre)
  const SUBTITULOS = [
    ['piel tejida', 'Recubrimiento en bambú'], ['edificio san german', 'Vivienda multifamiliar'], ['edif san german', 'Vivienda multifamiliar'],
    ['atalaya', 'Mirador en bambú'], ['astra', 'Estación de servicio'], ['girder box', 'Elemento estructural de concreto'],
    ['bridge box', 'Elemento estructural de concreto'], ['cenit', 'Luminaria en concreto'], ['moai', 'Estatua en cemento'],
    ['tangara', 'Mueble expositivo'], ['coltejer', 'Arquitectura icónica'], ['jersey', 'Portalápices en microconcreto'],
    ['dorica', 'Maceta en concreto pigmentado'], ['zarcillo', 'Tutor para plantas trepadoras'], ['skull', 'Figura de cemento']
  ];
  function subtitulo(titulo) {
    const t = normal(titulo);
    const par = SUBTITULOS.find(([k]) => t === k) || SUBTITULOS.find(([k]) => t.includes(k));
    return par ? par[1] : '';
  }
  function codigo(titulo) {
    const t = normal(titulo);
    const par = CODIGOS.find(([k]) => t === k) || CODIGOS.find(([k]) => t.includes(k));
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
    const ficha = nombreFicha(titulo);
    a.href = ficha && ficha !== 'post' ? `${prefijo}publicaciones/${ficha}.html` : `${prefijo}publicaciones/post.html?id=${encodeURIComponent(p._id)}`;
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

    // Línea morada y debajo "Título | descripción"
    const pie = document.createElement('div');
    pie.className = 'cat';
    const h3 = document.createElement('h3');
    const b = document.createElement('b');
    b.textContent = titulo;
    h3.appendChild(b);
    const rasgo = subtitulo(titulo) || lista(p.features)[0];
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

  window.PL_SANITY = { consultar, imagen, srcset, nombreFicha, texto, lista, tarjeta, aviso, codigo, categoria, subtitulo };
})();

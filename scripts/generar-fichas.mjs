// Genera una página fija por proyecto (publicaciones/<nombre>.html) a partir de Sanity.
// Cada página lleva su título, descripción e imagen en las etiquetas que leen Google, WhatsApp y LinkedIn,
// y carga el mismo diseño de publicaciones/post.html. También actualiza sitemap.xml.
//
// Uso:  node scripts/generar-fichas.mjs                 (consulta Sanity)
//       node scripts/generar-fichas.mjs datos.json      (usa un JSON con el resultado de la consulta)
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITIO = 'https://porticolab.com';
const PROYECTO = '32sykluw';
const DATASET = 'production';
const MARCA = '<!-- ficha generada por scripts/generar-fichas.mjs: no editar a mano -->';
const CONSULTA = '*[_type == "proyecto" && slug.current != "barra-sitio" && defined(portada.asset) && defined(title)] | order(_createdAt asc){ _id, title, description, tags, "portada": portada.asset._ref, _updatedAt }';

// Mismo criterio que nombreFicha() en sanity.js: si cambia uno, cambia el otro.
export function nombreFicha(titulo) {
  return String(titulo || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const corto = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; };

function imagenCompartir(ref, tags) {
  const m = /^image-([a-zA-Z0-9]+)-(\d+)x(\d+)-([a-z0-9]+)$/.exec(ref || '');
  if (!m) return `${SITIO}/img/og/inicio.jpg`;
  // Portadas del laboratorio (pieza sobre fondo blanco): se ve completa con margen blanco; el resto se recorta al centro.
  const ajuste = (tags || []).includes('laboratorio') ? 'fit=fill&bg=ffffff' : 'fit=crop';
  return `https://cdn.sanity.io/images/${PROYECTO}/${DATASET}/${m[1]}-${m[2]}x${m[3]}.${m[4]}?w=1200&h=630&${ajuste}&fm=jpg&q=85`;
}

async function proyectos() {
  if (process.argv[2]) return JSON.parse(readFileSync(process.argv[2], 'utf8'));
  const url = `https://${PROYECTO}.apicdn.sanity.io/v2024-01-01/data/query/${DATASET}?query=${encodeURIComponent(CONSULTA)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sanity respondió ${res.status}`);
  const { result } = await res.json();
  if (!Array.isArray(result)) throw new Error('Respuesta inesperada de Sanity');
  return result;
}

const lista = await proyectos();
const plantilla = readFileSync(join(RAIZ, 'publicaciones/post.html'), 'utf8');
const dir = join(RAIZ, 'publicaciones');
const usados = new Map();
const fichas = [];

for (const p of lista) {
  const nombre = nombreFicha(p.title);
  if (!nombre || nombre === 'post') continue;
  if (usados.has(nombre)) { console.warn(`Título repetido, se omite: "${p.title}" (ya existe ${nombre}.html)`); continue; }
  usados.set(nombre, p._id);

  const titulo = String(p.title).trim();
  const desc = corto(p.description || `${titulo}, proyecto de Pórtico Lab en Medellín.`, 160);
  const url = `${SITIO}/publicaciones/${nombre}.html`;
  const img = imagenCompartir(p.portada, p.tags);
  const ld = { '@context': 'https://schema.org', '@type': 'CreativeWork', name: titulo, description: desc, image: img, url,
    creator: { '@type': 'Organization', name: 'Pórtico Lab', url: SITIO } };

  let html = plantilla
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(titulo)} | Pórtico Lab</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`)
    .replace(/<meta property="og:type" content="[^"]*">/, '<meta property="og:type" content="article">')
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(titulo)} | Pórtico Lab">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(desc)}">`)
    .replace(/<meta property="og:image" content="[^"]*">/,
      `<meta property="og:image" content="${esc(img)}">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n  <meta property="og:url" content="${url}">\n  <link rel="canonical" href="${url}">`)
    .replace('<meta charset="UTF-8">', `<meta charset="UTF-8">\n${MARCA}`)
    .replace('</head>', `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>\n<script>window.PL_FICHA = ${JSON.stringify({ id: p._id })};</script>\n</head>`)
    // Texto visible desde el primer momento (también para buscadores que no ejecutan JavaScript)
    .replace('<h1 id="post-title"></h1>', `<h1 id="post-title">${esc(titulo)}</h1>`);
  writeFileSync(join(dir, `${nombre}.html`), html);
  fichas.push({ nombre, fecha: (p._updatedAt || '').slice(0, 10) });
}

// Quita las fichas de proyectos que ya no están publicados
for (const f of readdirSync(dir)) {
  if (!f.endsWith('.html') || f === 'post.html' || usados.has(f.slice(0, -5))) continue;
  if (readFileSync(join(dir, f), 'utf8').includes(MARCA)) { unlinkSync(join(dir, f)); console.log('Eliminada', f); }
}

const fijas = [['/', '1.0'], ['/servicios.html', '0.9'], ['/laboratorio.html', '0.8'], ['/nosotros.html', '0.7'], ['/inspiracion.html', '0.5']];
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  fijas.map(([u, pr]) => `  <url><loc>${SITIO}${u}</loc><priority>${pr}</priority></url>`).join('\n') + '\n' +
  fichas.map(f => `  <url><loc>${SITIO}/publicaciones/${f.nombre}.html</loc>${f.fecha ? `<lastmod>${f.fecha}</lastmod>` : ''}<priority>0.6</priority></url>`).join('\n') +
  '\n</urlset>\n';
writeFileSync(join(RAIZ, 'sitemap.xml'), sitemap);
console.log(`${fichas.length} fichas generadas`);

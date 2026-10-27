// Carrito de compras compartido entre todas las páginas (localStorage, sin backend).

const CARRITO_KEY = 'porticolab_carrito';

// Solo se aceptan artículos bien formados: el carrito se pinta como HTML y el id va en los botones.
function articuloValido(it) {
  return it && typeof it.id === 'string' && /^[A-Za-z0-9._-]{1,80}$/.test(it.id) &&
    typeof it.title === 'string' && Number.isFinite(it.precio) && it.precio >= 0 &&
    Number.isInteger(it.cantidad) && it.cantidad >= 1 && it.cantidad <= 20;
}

function getCarrito() {
  try {
    const raw = localStorage.getItem(CARRITO_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items.filter(articuloValido) : [];
  } catch (e) {
    return [];
  }
}

function escaparHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Precios confirmados por el servidor: corrige los del carrito y quita lo que ya no está a la venta.
function actualizarPreciosCarrito(precios) {
  guardarCarrito(getCarrito()
    .filter(it => typeof precios[it.id] === 'number')
    .map(it => Object.assign({}, it, { precio: precios[it.id] })));
}

function guardarCarrito(items) {
  try { localStorage.setItem(CARRITO_KEY, JSON.stringify(items)); } catch (e) {}
  actualizarBadgeCarrito();
}

function agregarAlCarrito(id, title, precio) {
  const items = getCarrito();
  const existente = items.find(it => it.id === id);
  if (existente) {
    existente.cantidad = Math.min(20, existente.cantidad + 1);
  } else {
    items.push({ id, title, precio, cantidad: 1 });
  }
  guardarCarrito(items);
}

function quitarDelCarrito(id) {
  guardarCarrito(getCarrito().filter(it => it.id !== id));
}

function actualizarCantidadCarrito(id, cantidad) {
  const items = getCarrito();
  const item = items.find(it => it.id === id);
  if (!item) return;
  if (cantidad <= 0) {
    guardarCarrito(items.filter(it => it.id !== id));
    return;
  }
  item.cantidad = Math.min(20, cantidad);
  guardarCarrito(items);
}

function vaciarCarrito() {
  guardarCarrito([]);
}

function totalCarrito() {
  return getCarrito().reduce((sum, it) => sum + it.precio * it.cantidad, 0);
}

function cantidadTotalCarrito() {
  return getCarrito().reduce((sum, it) => sum + it.cantidad, 0);
}

function actualizarBadgeCarrito() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const cantidad = cantidadTotalCarrito();
  badge.textContent = cantidad;
  badge.style.display = cantidad > 0 ? 'flex' : 'none';
}

document.addEventListener('DOMContentLoaded', actualizarBadgeCarrito);

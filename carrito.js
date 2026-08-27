// Carrito de compras compartido entre todas las páginas (localStorage, sin backend).

const CARRITO_KEY = 'porticolab_carrito';

function getCarrito() {
  try {
    const raw = localStorage.getItem(CARRITO_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function guardarCarrito(items) {
  try { localStorage.setItem(CARRITO_KEY, JSON.stringify(items)); } catch (e) {}
  actualizarBadgeCarrito();
}

function agregarAlCarrito(id, title, precio) {
  const items = getCarrito();
  const existente = items.find(it => it.id === id);
  if (existente) {
    existente.cantidad += 1;
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
  item.cantidad = cantidad;
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

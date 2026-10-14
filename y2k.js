// Cursor personalizado pequeño (círculo con punto) solo con mouse. El cursor nativo se mantiene.
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const suave = !matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cursor = document.createElement('div');
  cursor.className = 'y2k-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursor);

  let x = -100, y = -100, cx = x, cy = y, corriendo = false;

  function cuadro() {
    cx += (x - cx) * (suave ? 0.28 : 1);
    cy += (y - cy) * (suave ? 0.28 : 1);
    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    if (Math.abs(x - cx) > 0.2 || Math.abs(y - cy) > 0.2) requestAnimationFrame(cuadro);
    else corriendo = false;
  }

  addEventListener('pointermove', e => {
    x = e.clientX;
    y = e.clientY;
    cursor.classList.add('on');
    cursor.classList.toggle('act', !!e.target.closest('a, button, input, select, textarea, summary, label, [role="button"], [role="radio"]'));
    if (!corriendo) { corriendo = true; requestAnimationFrame(cuadro); }
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => cursor.classList.remove('on'));
})();

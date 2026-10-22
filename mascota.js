(function () {
  const css = `
    #mascota-wrapper {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    #mascota-wrapper:focus-visible { outline: 2px solid #fff; outline-offset: 6px; border-radius: 6px; }

    #mascota-label {
      font-family: 'Montserrat', sans-serif;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 1.4px;
      color: #fff;
      opacity: 1;
      text-transform: uppercase;
      white-space: nowrap;
      padding: 4px 7px;
      border: 1px solid rgba(185, 167, 255, 0.42);
      border-radius: 999px;
      background: rgba(12, 12, 14, 0.9);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      transition: opacity 0.3s;
    }
    #mascota-wrapper:hover #mascota-label,
    #mascota-wrapper:focus-visible #mascota-label { opacity: 1; }

    /* El calculador: bloque de concreto con lentes, un visor en el pecho que va sumando barras y tres puntos de "pensando" */
    .mascota-sprite {
      display: block;
      width: 64px;
      height: 46px;
      overflow: visible;
      filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5));
      transition: transform 0.3s ease;
    }
    #mascota-wrapper:hover .mascota-sprite,
    #mascota-wrapper:focus-visible .mascota-sprite { transform: translateY(-2px); }
    .mascota-sprite .ojos { transform-box: fill-box; transform-origin: center; }
    .mascota-sprite .barra { transform-box: fill-box; transform-origin: 50% 100%; }
    .mascota-sprite .punto { opacity: 0; }
    #mascota-modal .mascota-sprite { width: 82px; height: 59px; }

    @media (max-width: 768px) {
      #mascota-wrapper { bottom: 14px; right: 14px; }
      #mascota-wrapper .mascota-sprite { width: 51px; height: 37px; }
    }

    /* Movimiento: sereno y numérico, y solo si el usuario no pidió menos animación */
    @media (prefers-reduced-motion: no-preference) {
      .mascota-sprite .todo { animation: mascota-respira 3.6s ease-in-out infinite; }
      @keyframes mascota-respira { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-0.8px); } }
      .mascota-sprite .b1 { animation: mascota-barra 3.4s steps(5, end) infinite; }
      .mascota-sprite .b2 { animation: mascota-barra 2.6s steps(5, end) infinite reverse; }
      .mascota-sprite .b3 { animation: mascota-barra 4.1s steps(5, end) infinite; }
      .mascota-sprite .b4 { animation: mascota-barra 3s steps(5, end) infinite reverse; }
      @keyframes mascota-barra { 0% { transform: scaleY(0.35); } 100% { transform: scaleY(1); } }
      .mascota-sprite.parpadea .ojos { transform: scaleY(0.1); }
      .mascota-sprite.lee .ojos { animation: mascota-lee 1.7s steps(1) 1; }
      @keyframes mascota-lee { 0% { transform: translateX(-1px); } 25% { transform: translateX(1px); } 50% { transform: translateX(-1px); } 75% { transform: translateX(1px); } 100% { transform: none; } }
      .mascota-sprite.calcula .ojos { transform: translateY(-0.9px); }
      .mascota-sprite.calcula .barra { animation-duration: 0.5s; }
      .mascota-sprite.calcula .punto { animation: mascota-punto 2.2s steps(1) 1; }
      .mascota-sprite.calcula .p2 { animation-delay: 0.35s; }
      .mascota-sprite.calcula .p3 { animation-delay: 0.7s; }
      @keyframes mascota-punto { 0% { opacity: 0; } 12%, 80% { opacity: 1; } 100% { opacity: 0; } }
    }

    /* Modal */
    #mascota-modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.75);
      z-index: 2000;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(6px);
    }

    #mascota-modal-overlay.open {
      display: flex;
    }

    #mascota-modal {
      background: #111;
      border: 1px solid #2a2a2a;
      border-radius: 4px;
      padding: 40px;
      width: 340px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      position: relative;
      animation: modal-in 0.25s ease;
    }

    @keyframes modal-in {
      from { opacity: 0; transform: translateY(16px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    #mascota-modal-close {
      position: absolute;
      top: 14px;
      right: 18px;
      background: none;
      border: none;
      color: #666;
      font-size: 20px;
      cursor: pointer;
      line-height: 1;
      transition: color 0.2s;
    }

    #mascota-modal-close:hover { color: #fff; }

    #mascota-modal h2 {
      font-family: 'Montserrat', sans-serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #fff;
      text-align: center;
    }

    #mascota-modal p {
      font-family: 'Montserrat', sans-serif;
      font-size: 12px;
      color: #888;
      text-align: center;
      line-height: 1.6;
    }

    .mascota-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 14px 20px;
      border-radius: 3px;
      border: 1px solid #2a2a2a;
      background: #1a1a1a;
      color: #fff;
      font-family: 'Montserrat', sans-serif;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      text-decoration: none;
      cursor: pointer;
      transition: background 0.2s, border-color 0.2s;
    }

    .mascota-btn:hover {
      background: #222;
      border-color: #444;
    }

    .mascota-btn svg { flex-shrink: 0; }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ── Personaje: el calculador, en pixel art plano (hermano de la mascota de Claude Code): cuerpo de concreto, lentes,
     un visor en el pecho con barras que suben y bajan, y tres puntos que aparecen cuando "piensa". ── */
  function sprite(id) {
    const R = (x, y, w, h, c, k) => '<rect' + (k ? ' class="' + k + '"' : '') + ' x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '"/>';
    const C = '#b4b4be', B = '#f4f4f8', N = '#0b0b0b', A = '#7ee8ff', G = '#8a8a97';
    return '<svg ' + (id ? 'id="' + id + '" ' : '') + 'class="mascota-sprite" viewBox="-4 -6 32 23" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" role="img" aria-label="Calculador de Pórtico Lab">' +
      '<g class="todo">' +
        // patas cortas
        R(0, 10, 3, 5, C) + R(6, 10, 3, 5, C) + R(15, 10, 3, 5, C) + R(21, 10, 3, 5, C) +
        // cuerpo y brazos pequeños
        R(0, 0, 24, 10, C) + R(-3, 6, 3, 3, C) + R(24, 6, 3, 3, C) +
        // lentes finos y ojos
        '<g fill="none" stroke="#f4f4f8" stroke-width="0.7"><rect x="2" y="1.3" width="5.2" height="4.4"/><rect x="16.8" y="1.3" width="5.2" height="4.4"/><path d="M7.2 3.1H16.8"/></g>' +
        '<g class="ojos">' + R(3.3, 2.5, 2.4, 2.2, N) + R(18.3, 2.5, 2.4, 2.2, N) + '</g>' +
        // puntos de "pensando"
        R(8.5, -3.5, 1.7, 1.7, A, 'punto p1') + R(11.2, -3.5, 1.7, 1.7, A, 'punto p2') + R(13.9, -3.5, 1.7, 1.7, A, 'punto p3') +
      '</g></svg>';
  }

  const wrapper = document.createElement('div');
  wrapper.id = 'mascota-wrapper';
  wrapper.setAttribute('role', 'button');
  wrapper.setAttribute('tabindex', '0');
  wrapper.setAttribute('aria-label', 'Contacto');
  wrapper.innerHTML = sprite('mascota-svg') + '<span id="mascota-label">Contacto</span>';

  const overlay = document.createElement('div');
  overlay.id = 'mascota-modal-overlay';
  overlay.innerHTML = `
    <div id="mascota-modal">
      <button id="mascota-modal-close" aria-label="Cerrar">&#x2715;</button>

      ${sprite('mascota-modal-sprite')}

      <h2>Hablemos de su proyecto</h2>
      <p>Escríbanos y le responderemos con<br>una propuesta a la medida.</p>

      <a class="mascota-btn" href="https://wa.me/573147924600?text=Hola%20Portico%20Lab%2C%20me%20interesa%20hablar%20sobre%20un%20proyecto" target="_blank" rel="noopener">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.18-1.58A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22a9.93 9.93 0 0 1-5.06-1.38l-.36-.22-3.73.95.99-3.62-.24-.37A9.93 9.93 0 0 1 2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm5.47-7.4c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.63-.93-2.23-.24-.59-.49-.51-.68-.52h-.58c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.89.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z"/></svg>
        WhatsApp
      </a>

      <a class="mascota-btn" href="mailto:contacto@porticolab.com?subject=Proyecto%20Portico%20Lab" target="_blank" rel="noopener">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
        Email
      </a>
    </div>
  `;

  document.body.appendChild(wrapper);
  document.body.appendChild(overlay);

  const abrir = () => overlay.classList.add('open');
  wrapper.addEventListener('click', abrir);
  wrapper.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(); }
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
  document.getElementById('mascota-modal-close').addEventListener('click', () => {
    overlay.classList.remove('open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay.classList.remove('open');
  });

  /* ── Comportamiento: parpadea, lee de lado a lado como si revisara cifras y de vez en cuando "calcula" ── */
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const svg = document.getElementById('mascota-svg');
  const ocupada = new Set();
  function animar(clase, ms) {
    if (ocupada.has(clase)) return;
    ocupada.add(clase);
    svg.classList.add(clase);
    setTimeout(() => { svg.classList.remove(clase); ocupada.delete(clase); }, ms);
  }
  const parpadear = () => { animar('parpadea', 150); if (Math.random() < 0.2) setTimeout(() => animar('parpadea', 150), 340); };
  const leer = () => animar('lee', 1700);
  const calcular = () => animar('calcula', 2300);

  function accion() {
    if (!document.hidden && !overlay.classList.contains('open')) {
      const r = Math.random();
      if (r < 0.5) parpadear(); else if (r < 0.75) leer(); else calcular();
    }
    setTimeout(accion, 4200 + Math.random() * 3800);
  }
  setTimeout(calcular, 1600);
  setTimeout(accion, 6500);
})();

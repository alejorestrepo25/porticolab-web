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
      font-family: 'Space Mono', 'Montserrat', monospace;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 2.5px;
      color: #fff;
      opacity: 0.55;
      text-transform: uppercase;
      transition: opacity 0.3s;
    }
    #mascota-wrapper:hover #mascota-label,
    #mascota-wrapper:focus-visible #mascota-label { opacity: 1; }

    /* Hermano constructor: un bloque de concreto con casco amarillo, dos ojos verticales y brazos laterales */
    .mascota-sprite {
      display: block;
      width: 84px;
      height: 62px;
      overflow: visible;
      filter: drop-shadow(0 6px 8px rgba(0, 0, 0, 0.55));
      transition: transform 0.3s ease;
    }
    #mascota-wrapper:hover .mascota-sprite,
    #mascota-wrapper:focus-visible .mascota-sprite { transform: translateY(-2px); }
    .mascota-sprite .ojos { transform-box: fill-box; transform-origin: center; }
    .mascota-sprite .brazo-d { transform-origin: 44px -20px; transition: transform 0.35s ease; }
    .mascota-sprite .casco { transform-origin: 20px -40px; }
    #mascota-wrapper:hover .mascota-sprite .brazo-d,
    #mascota-wrapper:focus-visible .mascota-sprite .brazo-d { transform: rotate(-38deg); }

    #mascota-modal .mascota-sprite { width: 96px; height: 71px; }

    @media (max-width: 768px) {
      #mascota-wrapper { bottom: 14px; right: 14px; }
      #mascota-wrapper .mascota-sprite { width: 66px; height: 49px; }
    }

    /* Movimiento: tranquilo, y solo si el usuario no pidió menos animación */
    @media (prefers-reduced-motion: no-preference) {
      .mascota-sprite .todo { animation: mascota-respira 3.4s ease-in-out infinite; }
      @keyframes mascota-respira { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-0.9px); } }
      .mascota-sprite.parpadea .ojos { transform: scaleY(0.1); }
      .mascota-sprite.saluda .brazo-d { animation: mascota-saludo 1.7s ease-in-out 1; }
      @keyframes mascota-saludo {
        0%, 100% { transform: rotate(0deg); } 18% { transform: rotate(-58deg); } 38% { transform: rotate(-40deg); }
        58% { transform: rotate(-58deg); } 78% { transform: rotate(-40deg); }
      }
      .mascota-sprite.saluda-casco .casco { animation: mascota-casco 1.3s ease-in-out 1; }
      @keyframes mascota-casco {
        0%, 100% { transform: none; } 25%, 70% { transform: translate(-1.5px, -5px) rotate(-9deg); }
      }
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

  /* ── Personaje: un constructor de bloques (hermano de la mascota de Claude Code): cuerpo de concreto, casco amarillo,
     dos ojos verticales, brazos laterales y patas cortas. Proyección oblicua: frente plano, tapa y costado visibles. ── */
  function sprite(id) {
    const P = (x, d, z) => [x + 0.5 * d, -z - 0.32 * d];
    const pt = (p) => p[0].toFixed(1) + ',' + p[1].toFixed(1);
    const poly = (pts, fill) => '<polygon points="' + pts.map(pt).join(' ') + '" fill="' + fill + '"/>';
    const caja = (x0, d0, z0, x1, d1, z1, c) =>
      poly([P(x1, d0, z0), P(x1, d1, z0), P(x1, d1, z1), P(x1, d0, z1)], c.r) +
      poly([P(x0, d0, z1), P(x1, d0, z1), P(x1, d1, z1), P(x0, d1, z1)], c.t) +
      poly([P(x0, d0, z0), P(x1, d0, z0), P(x1, d0, z1), P(x0, d0, z1)], c.f);
    const concreto = { f: '#bdbdc7', t: '#e3e3ea', r: '#8d8d99' };
    const sombra = { f: '#8f8f9b', t: '#b1b1bb', r: '#6d6d78' };
    const amarillo = { f: '#ffc61a', t: '#ffe27a', r: '#d99c00' };
    const cresta = { f: '#e0a800', t: '#f2c230', r: '#b98a00' };
    return '<svg ' + (id ? 'id="' + id + '" ' : '') + 'class="mascota-sprite" viewBox="-12 -54 78 58" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Constructor de Pórtico Lab">' +
      '<ellipse cx="26" cy="-1" rx="30" ry="3.2" fill="rgba(0,0,0,0.45)"/>' +
      '<g class="todo">' +
        // patas: primero las de atrás
        caja(13, 12, 0, 19, 19, 8, sombra) + caja(21, 12, 0, 27, 19, 8, sombra) +
        caja(5, 2, 0, 11, 9, 8, sombra) + caja(29, 2, 0, 35, 9, 8, sombra) +
        // cuerpo, con dos bandas reflectivas
        caja(0, 0, 8, 40, 22, 34, concreto) +
        '<rect x="0" y="-15.2" width="40" height="1.8" fill="#f4f4f8" opacity="0.9"/>' +
        '<rect x="0" y="-12.2" width="40" height="1.8" fill="#f4f4f8" opacity="0.9"/>' +
        // ojos
        '<g class="ojos" fill="#0b0b0b"><rect x="9" y="-28" width="4" height="10"/><rect x="27" y="-28" width="4" height="10"/></g>' +
        // brazos
        caja(-9, 6, 14, 0, 16, 23, concreto) +
        '<g class="brazo-d">' + caja(40, 6, 14, 49, 16, 23, concreto) + '</g>' +
        // casco de obra
        '<g class="casco">' + caja(2, 0, 34, 38, 22, 36.4, amarillo) + caja(7, 3, 36.4, 33, 19, 43, amarillo) + caja(18, 3, 43, 22, 19, 44.2, cresta) + '</g>' +
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

  /* ── Comportamiento: parpadea, a veces saluda con la mano o se toca el casco; nada de saltos ── */
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const svg = document.getElementById('mascota-svg');
  const ocupada = new Set();
  function animar(clase, ms) {
    if (ocupada.has(clase)) return;
    ocupada.add(clase);
    svg.classList.add(clase);
    setTimeout(() => { svg.classList.remove(clase); ocupada.delete(clase); }, ms);
  }
  const parpadear = () => { animar('parpadea', 150); if (Math.random() < 0.25) setTimeout(() => animar('parpadea', 150), 360); };
  const saludar = () => animar('saluda', 1700);
  const tocarCasco = () => animar('saluda-casco', 1300);

  function accion() {
    if (!document.hidden && !overlay.classList.contains('open')) {
      const r = Math.random();
      if (r < 0.6) parpadear(); else if (r < 0.82) saludar(); else tocarCasco();
    }
    setTimeout(accion, 4500 + Math.random() * 4000);
  }
  setTimeout(saludar, 1600);
  setTimeout(accion, 6500);
})();

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
    #mascota-wrapper:focus-visible { outline: 2px solid #b9a7ff; outline-offset: 6px; border-radius: 6px; }

    #mascota-label {
      font-family: 'Space Mono', 'Montserrat', monospace;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 2px;
      color: #fff;
      opacity: 0.55;
      text-transform: uppercase;
      transition: opacity 0.3s;
    }
    #mascota-wrapper:hover #mascota-label,
    #mascota-wrapper:focus-visible #mascota-label { opacity: 1; }

    /* Personaje en pixel art: 1 unidad del dibujo = 4 px */
    .mascota-sprite {
      display: block;
      width: 64px;
      height: 56px;
      overflow: visible;
      shape-rendering: crispEdges;
      filter: drop-shadow(0 0 6px rgba(185, 167, 255, 0.28));
      transition: filter 0.3s;
    }
    #mascota-wrapper:hover .mascota-sprite { filter: drop-shadow(0 0 14px rgba(126, 232, 255, 0.55)); }
    .mascota-sprite .ojos { transform-box: fill-box; transform-origin: center; }
    .mascota-sprite .antena { animation: mascota-antena 1.4s steps(1) infinite; }
    @keyframes mascota-antena { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }

    #mascota-modal .mascota-sprite { width: 48px; height: 42px; filter: drop-shadow(0 0 8px rgba(185, 167, 255, 0.35)); }

    @media (max-width: 768px) {
      #mascota-wrapper { bottom: 14px; right: 14px; }
      .mascota-sprite { width: 48px; height: 42px; }
    }

    /* Movimiento: solo si el usuario no pidió menos animación */
    @media (prefers-reduced-motion: no-preference) {
      #mascota-wrapper .todo { animation: mascota-respira 1.6s steps(1) infinite; }
      @keyframes mascota-respira { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-1px); } }

      #mascota-wrapper .parpadea .ojos { transform: scaleY(0.15); }
      #mascota-wrapper .mira-i .ojos { transform: translateX(-1px); }
      #mascota-wrapper .mira-d .ojos { transform: translateX(1px); }

      #mascota-wrapper .salta .todo { animation: mascota-salto 0.72s steps(1) 1; }
      @keyframes mascota-salto {
        0% { transform: translateY(0); }  12% { transform: translateY(-1px); } 24% { transform: translateY(-2px); }
        36% { transform: translateY(-3px); } 52% { transform: translateY(-2px); } 66% { transform: translateY(-1px); }
        80% { transform: translateY(0); } 90% { transform: translateY(1px); } 100% { transform: translateY(0); }
      }

      #mascota-wrapper .saluda .brazo-d { animation: mascota-saludo 0.3s steps(1) 6; }
      @keyframes mascota-saludo {
        0% { transform: translate(0, -2px); }
        50% { transform: translate(1px, -3px); }
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

  /* ── Personaje: un pequeño "pórtico" (cornisa, cuerpo y dos columnas) en pixel art ──
     Cuadrícula de 16 x 14 unidades; cada rect es un bloque de píxeles. */
  const R = (x, y, w, h, c) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '"/>';
  function sprite(id) {
    return '<svg ' + (id ? 'id="' + id + '" ' : '') + 'class="mascota-sprite" viewBox="0 0 16 14" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mascota de Pórtico Lab">' +
      '<g class="todo">' +
        R(2, 13, 12, 1, 'rgba(0,0,0,0.5)') +
        '<g class="piernas">' + R(4, 8, 3, 4, '#e8e8ee') + R(9, 8, 3, 4, '#e8e8ee') + R(6, 8, 1, 4, '#c9c9e0') + R(11, 8, 1, 4, '#c9c9e0') + R(3, 12, 5, 1, '#7ee8ff') + R(8, 12, 5, 1, '#7ee8ff') + '</g>' +
        '<g class="antena">' + R(7, 0, 2, 1, '#7ee8ff') + '</g>' +
        R(2, 1, 12, 1, '#e8e8ee') + R(3, 2, 10, 1, '#c9c9e0') +
        R(3, 3, 10, 5, '#b9a7ff') + R(3, 3, 1, 4, '#d6ccff') + R(12, 3, 1, 4, '#9d8cf0') + R(3, 7, 10, 1, '#8f7ee0') +
        '<g class="ojos">' + R(5, 4, 2, 2, '#0b0b0b') + R(9, 4, 2, 2, '#0b0b0b') + R(5, 4, 1, 1, '#7ee8ff') + R(9, 4, 1, 1, '#7ee8ff') + '</g>' +
        R(7, 6, 2, 1, '#0b0b0b') +
        '<g class="brazo-i">' + R(1, 5, 2, 2, '#b9a7ff') + '</g>' +
        '<g class="brazo-d">' + R(13, 5, 2, 2, '#b9a7ff') + '</g>' +
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
      <button id="mascota-modal-close">&#x2715;</button>

      ${sprite('mascota-modal-sprite')}

      <h2>Hablemos</h2>
      <p>¿Te interesa alguno de nuestros proyectos?<br>Escríbenos y te contamos más.</p>

      <a class="mascota-btn" href="https://wa.me/573147924600?text=Hola%20Portico%20Lab%2C%20me%20interesa%20hablar%20sobre%20un%20proyecto" target="_blank" rel="noopener">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.18-1.58A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22a9.93 9.93 0 0 1-5.06-1.38l-.36-.22-3.73.95.99-3.62-.24-.37A9.93 9.93 0 0 1 2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm5.47-7.4c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.63-.93-2.23-.24-.59-.49-.51-.68-.52h-.58c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.89.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z"/></svg>
        WhatsApp
      </a>

      <a class="mascota-btn" href="mailto:alrestreporo@gmail.com?subject=Proyecto%20Portico%20Lab" target="_blank" rel="noopener">
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

  /* ── Vida propia: cada cierto tiempo parpadea, mira a los lados, salta o saluda ── */
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const svg = document.getElementById('mascota-svg');
  const ocupada = new Set();
  function animar(clase, ms) {
    if (ocupada.has(clase)) return;
    ocupada.add(clase);
    svg.classList.add(clase);
    setTimeout(() => { svg.classList.remove(clase); ocupada.delete(clase); }, ms);
  }
  const parpadear = () => { animar('parpadea', 160); if (Math.random() < 0.3) setTimeout(() => animar('parpadea', 160), 380); };
  const mirar = () => { const c = Math.random() < 0.5 ? 'mira-i' : 'mira-d'; animar(c, 900); setTimeout(parpadear, 950); };
  const saltar = () => animar('salta', 720);
  const saludar = () => animar('saluda', 1800);

  function accion() {
    if (!document.hidden && !overlay.classList.contains('open')) {
      const r = Math.random();
      if (r < 0.4) parpadear();
      else if (r < 0.62) mirar();
      else if (r < 0.82) saltar();
      else saludar();
    }
    setTimeout(accion, 2800 + Math.random() * 3600);
  }
  setTimeout(saludar, 1800);                       // un saludo al llegar
  setTimeout(accion, 6000);
  wrapper.addEventListener('mouseenter', saltar);
})();

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
      letter-spacing: 2px;
      color: #fff;
      opacity: 0.55;
      text-transform: uppercase;
      transition: opacity 0.3s;
    }
    #mascota-wrapper:hover #mascota-label,
    #mascota-wrapper:focus-visible #mascota-label { opacity: 1; }

    /* Personaje en pixel art: 1 unidad del dibujo = 4.5 px */
    .mascota-sprite {
      display: block;
      width: 72px;
      height: 81px;
      overflow: visible;
      shape-rendering: crispEdges;
      filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.14));
      transition: filter 0.3s;
    }
    #mascota-wrapper:hover .mascota-sprite { filter: drop-shadow(0 0 14px rgba(255, 255, 255, 0.35)); }
    .mascota-sprite .ojos { transform-box: fill-box; transform-origin: center; }
    .mascota-sprite .viga, .mascota-sprite .col-i, .mascota-sprite .col-d { transform-box: fill-box; }

    /* Materiales: concreto, madera y acero (misma forma, otra piel) */
    .mascota-sprite { --c: #cfcfd7; --l: #f0f0f5; --m: #8f8f9a; --g: #8f8f9a; }
    .mascota-sprite.mat-madera { --c: #c08a55; --l: #e2b57f; --m: #7a4f2c; --g: #8a5a30; }
    .mascota-sprite.mat-acero { --c: #9fb0c0; --l: #e3ecf4; --m: #55646f; --g: #3f4c57; }
    .mascota-sprite .c { fill: var(--c); }
    .mascota-sprite .l { fill: var(--l); }
    .mascota-sprite .m { fill: var(--m); }
    .mascota-sprite .g { fill: var(--g); }
    .mascota-sprite .v { fill: #0b0b0b; }
    .mascota-sprite .tx { display: none; }
    .mascota-sprite .tx-concreto { display: inline; }
    .mascota-sprite.mat-madera .tx-concreto, .mascota-sprite.mat-acero .tx-concreto { display: none; }
    .mascota-sprite.mat-madera .tx-madera, .mascota-sprite.mat-acero .tx-acero { display: inline; }

    #mascota-modal .mascota-sprite { width: 56px; height: 63px; filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.2)); }

    @media (max-width: 768px) {
      #mascota-wrapper { bottom: 14px; right: 14px; }
      .mascota-sprite { width: 56px; height: 63px; }
    }

    /* Movimiento: solo si el usuario no pidió menos animación */
    @media (prefers-reduced-motion: no-preference) {
      #mascota-wrapper .todo { animation: mascota-respira 1.8s steps(1) infinite; }
      @keyframes mascota-respira { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-1px); } }

      #mascota-wrapper .parpadea .ojos { transform: scaleY(0.15); }
      #mascota-wrapper .mira-i .ojos { transform: translateX(-1px); }
      #mascota-wrapper .mira-d .ojos { transform: translateX(1px); }

      #mascota-wrapper .escanea .ojos { animation: mascota-escaneo 1s steps(1) 1; }
      @keyframes mascota-escaneo {
        0% { transform: translateX(-1px); } 20% { transform: translateX(1px); } 40% { transform: translateX(-1px); }
        60% { transform: translateX(1px); } 80% { transform: translateX(0); }
      }

      #mascota-wrapper .cambia .todo { animation: mascota-cambia 0.7s steps(1) 1; }
      @keyframes mascota-cambia {
        0% { opacity: 1; } 15% { opacity: 0.15; } 30% { opacity: 1; } 45% { opacity: 0.15; } 60% { opacity: 1; } 75% { opacity: 0.4; } 90% { opacity: 1; }
      }

      #mascota-wrapper .salta .todo { animation: mascota-salto 0.72s steps(1) 1; }
      @keyframes mascota-salto {
        0% { transform: translateY(0); } 12% { transform: translateY(-1px); } 24% { transform: translateY(-2px); }
        36% { transform: translateY(-3px); } 52% { transform: translateY(-2px); } 66% { transform: translateY(-1px); }
        80% { transform: translateY(0); } 90% { transform: translateY(1px); } 100% { transform: translateY(0); }
      }

      /* Paso estilo TARS: las columnas se alternan y la viga se balancea encima */
      #mascota-wrapper .camina .col-i { animation: mascota-paso-i 1.6s steps(1) 1; }
      #mascota-wrapper .camina .col-d { animation: mascota-paso-d 1.6s steps(1) 1; }
      #mascota-wrapper .camina .viga { animation: mascota-balanceo 1.6s steps(1) 1; }
      @keyframes mascota-paso-i { 0% { transform: translate(0, -2px); } 12.5% { transform: translate(1px, 0); } 25% { transform: translate(0, 0); }
        50% { transform: translate(0, -2px); } 62.5% { transform: translate(1px, 0); } 75% { transform: translate(0, 0); } }
      @keyframes mascota-paso-d { 0% { transform: translate(0, 0); } 25% { transform: translate(0, -2px); } 37.5% { transform: translate(-1px, 0); } 50% { transform: translate(0, 0); }
        75% { transform: translate(0, -2px); } 87.5% { transform: translate(-1px, 0); } 100% { transform: translate(0, 0); } }
      @keyframes mascota-balanceo { 0% { transform: translateX(-1px); } 25% { transform: translateX(1px); } 50% { transform: translateX(-1px); } 75% { transform: translateX(1px); } 100% { transform: translateX(0); } }
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

  /* ── Personaje: un pórtico hecho de monolitos articulados (guiño a TARS) ──
     Viga con dos ojos alargados (como los de Claude) sobre dos columnas de dos bloques cada una.
     La piel cambia entre concreto, madera y acero: la forma no depende del material.
     Cuadrícula de 16 x 18 unidades; cada rect es un bloque de píxeles. */
  const R = (x, y, w, h, k) => '<rect class="' + k + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"/>';
  const MATERIALES = ['concreto', 'madera', 'acero'];
  function sprite(id) {
    const losa = (x, y, w, h) => R(x, y, w, h, 'c') + R(x, y, 1, h, 'l') + R(x + w - 1, y, 1, h, 'm');
    const columna = (x, tx) => losa(x, 8, 3, 4) + losa(x, 13, 3, 4) + tx;
    // texturas por material (solo se ve la del material activo)
    const txIzq = '<g class="tx tx-concreto">' + R(3, 10, 1, 1, 'g') + R(3, 15, 1, 1, 'g') + '</g>' +
      '<g class="tx tx-madera">' + R(3, 9, 1, 2, 'g') + R(3, 14, 1, 2, 'g') + '</g>' +
      '<g class="tx tx-acero">' + R(3, 9, 1, 1, 'g') + R(3, 15, 1, 1, 'g') + '</g>';
    const txDer = '<g class="tx tx-concreto">' + R(12, 9, 1, 1, 'g') + R(12, 14, 1, 1, 'g') + '</g>' +
      '<g class="tx tx-madera">' + R(12, 10, 1, 2, 'g') + R(12, 13, 1, 2, 'g') + '</g>' +
      '<g class="tx tx-acero">' + R(12, 9, 1, 1, 'g') + R(12, 15, 1, 1, 'g') + '</g>';
    const txViga = '<g class="tx tx-concreto">' + R(2, 6, 1, 1, 'g') + R(7, 3, 1, 1, 'g') + R(8, 5, 1, 1, 'g') + R(13, 2, 1, 1, 'g') + '</g>' +
      '<g class="tx tx-madera">' + R(1, 3, 2, 1, 'g') + R(6, 2, 4, 1, 'g') + R(7, 5, 3, 1, 'g') + R(13, 4, 2, 1, 'g') + R(1, 6, 3, 1, 'g') + '</g>' +
      '<g class="tx tx-acero">' + R(1, 2, 1, 1, 'g') + R(14, 2, 1, 1, 'g') + R(1, 6, 1, 1, 'g') + R(14, 6, 1, 1, 'g') + '</g>';
    return '<svg ' + (id ? 'id="' + id + '" ' : '') + 'class="mascota-sprite" viewBox="0 0 16 18" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mascota de Pórtico Lab">' +
      '<g class="todo">' +
        '<rect x="1" y="17" width="14" height="1" fill="rgba(0,0,0,0.5)"/>' +
        '<g class="col-i">' + columna(2, txIzq) + '</g>' +
        '<g class="col-d">' + columna(11, txDer) + '</g>' +
        '<g class="viga">' + losa(0, 1, 16, 7) + R(0, 1, 16, 1, 'l') + R(0, 7, 16, 1, 'm') + txViga +
          '<g class="ojos">' + R(4, 3, 2, 3, 'v') + R(10, 3, 2, 3, 'v') + '</g></g>' +
      '</g></svg>';
  }
  function material(svgEl, nombre) {
    MATERIALES.forEach((m) => svgEl.classList.toggle('mat-' + m, m === nombre));
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

      <a class="mascota-btn" href="mailto:contacto@porticolab.com?subject=Proyecto%20Portico%20Lab" target="_blank" rel="noopener">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
        Email
      </a>
    </div>
  `;


  document.body.appendChild(wrapper);
  document.body.appendChild(overlay);

  // cada visita llega con un material distinto
  let actual = MATERIALES[Math.floor(Math.random() * MATERIALES.length)];
  const aplicarMaterial = () => {
    material(document.getElementById('mascota-svg'), actual);
    material(document.getElementById('mascota-modal-sprite'), actual);
  };
  aplicarMaterial();

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

  /* ── Vida propia: cada cierto tiempo parpadea, mira a los lados, camina, salta o escanea ── */
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
  const caminar = () => animar('camina', 1600);
  const escanear = () => animar('escanea', 1000);

  function accion() {
    if (!document.hidden && !overlay.classList.contains('open')) {
      const r = Math.random();
      if (r < 0.3) parpadear();
      else if (r < 0.5) mirar();
      else if (r < 0.7) caminar();
      else if (r < 0.85) saltar();
      else escanear();
    }
    setTimeout(accion, 2800 + Math.random() * 3600);
  }
  // cada tanto cambia de piel: concreto, madera, acero
  function transformar() {
    if (!document.hidden && !overlay.classList.contains('open') && !ocupada.has('cambia')) {
      animar('cambia', 700);
      setTimeout(() => { actual = MATERIALES[(MATERIALES.indexOf(actual) + 1) % MATERIALES.length]; aplicarMaterial(); }, 300);
    }
    setTimeout(transformar, 14000 + Math.random() * 8000);
  }
  setTimeout(transformar, 11000);
  setTimeout(caminar, 1800);                       // al llegar, da unos pasos
  setTimeout(accion, 6000);
  wrapper.addEventListener('mouseenter', saltar);
})();

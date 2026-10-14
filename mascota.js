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

    /* Sello técnico: un pórtico en elevación dibujado con líneas finas, acero cepillado y un único acento */
    .mascota-sprite {
      display: block;
      width: 56px;
      height: 63px;
      overflow: visible;
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.6));
      transition: filter 0.3s;
    }
    #mascota-wrapper:hover .mascota-sprite { filter: drop-shadow(0 0 12px rgba(126, 232, 255, 0.28)) drop-shadow(0 4px 10px rgba(0, 0, 0, 0.6)); }
    .mascota-sprite .plomada { transform-origin: 32px 26px; }
    .mascota-sprite .cota { stroke-dasharray: 100; stroke-dashoffset: 100; transition: stroke-dashoffset 0.5s ease; }
    .mascota-sprite .cota-marcas { opacity: 0; transition: opacity 0.4s ease; }
    #mascota-wrapper:hover .mascota-sprite .cota,
    #mascota-wrapper:focus-visible .mascota-sprite .cota { stroke-dashoffset: 0; }
    #mascota-wrapper:hover .mascota-sprite .cota-marcas,
    #mascota-wrapper:focus-visible .mascota-sprite .cota-marcas { opacity: 1; }

    #mascota-modal .mascota-sprite { width: 56px; height: 63px; }

    @media (max-width: 768px) {
      #mascota-wrapper { bottom: 14px; right: 14px; }
      #mascota-wrapper .mascota-sprite { width: 46px; height: 52px; }
    }

    /* Movimiento: lento y medido, y solo si el usuario no pidió menos animación */
    @media (prefers-reduced-motion: no-preference) {
      .mascota-sprite .plomada { animation: mascota-plomada 7s ease-in-out infinite; }
      @keyframes mascota-plomada { 0%, 100% { transform: rotate(-1.4deg); } 50% { transform: rotate(1.4deg); } }
      .mascota-sprite .estado { animation: mascota-estado 3.6s ease-in-out infinite; }
      @keyframes mascota-estado { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }

      /* Barrido del visor: como un instrumento que verifica */
      .mascota-sprite.barre .sensor { animation: mascota-barrido 2.2s cubic-bezier(.45, 0, .25, 1) 1; }
      @keyframes mascota-barrido { 0% { transform: translateX(0); opacity: 1; } 50% { transform: translateX(26px); } 100% { transform: translateX(0); } }

      /* Medición: se traza la cota bajo la base y vuelve a desaparecer */
      .mascota-sprite.mide .cota { animation: mascota-cota 3.2s ease 1; }
      .mascota-sprite.mide .cota-marcas { animation: mascota-marcas 3.2s ease 1; }
      @keyframes mascota-cota { 0% { stroke-dashoffset: 100; } 45%, 75% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 0; opacity: 0; } }
      @keyframes mascota-marcas { 0%, 35% { opacity: 0; } 50%, 75% { opacity: 1; } 100% { opacity: 0; } }
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

  /* ── Personaje: un pórtico en elevación, como un sello de plano técnico ──
     Frontón, cornisa, viga con visor de verificación, dos columnas acanaladas, plomada y cota de medida.
     Dibujo vectorial de líneas finas; el único color de acento es el cian del sensor. */
  function sprite(id) {
    const uid = id || 'm';
    return '<svg ' + (id ? 'id="' + id + '" ' : '') + 'class="mascota-sprite" viewBox="0 0 64 72" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sello de Pórtico Lab: pórtico en elevación">' +
      '<defs>' +
        '<linearGradient id="ac-' + uid + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f4f4f8"/><stop offset="0.45" stop-color="#b9b9c4"/><stop offset="1" stop-color="#6a6a76"/></linearGradient>' +
        '<linearGradient id="ar-' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9e9ef"/><stop offset="1" stop-color="#9a9aa6"/></linearGradient>' +
      '</defs>' +
      // base
      '<rect x="4" y="64" width="56" height="3.2" fill="#2b2b31" stroke="#cfcfd8" stroke-width="0.6"/>' +
      // columnas con acanalado
      '<g stroke="#e8e8ee" stroke-width="0.6">' +
        '<rect x="12" y="26" width="8.5" height="38" fill="url(#ac-' + uid + ')"/>' +
        '<rect x="43.5" y="26" width="8.5" height="38" fill="url(#ac-' + uid + ')"/>' +
      '</g>' +
      '<g stroke="#4c4c56" stroke-width="0.4" opacity="0.8"><path d="M14.7 27V63M17.8 27V63M46.2 27V63M49.3 27V63"/></g>' +
      // plomada
      '<g class="plomada"><path d="M32 26V51" stroke="#b9a7ff" stroke-width="0.6"/><path d="M32 51L34.2 54.4L32 57.8L29.8 54.4Z" fill="#b9a7ff" stroke="#e8e8ee" stroke-width="0.4"/></g>' +
      // viga y cornisa
      '<rect x="6" y="14" width="52" height="12" fill="url(#ar-' + uid + ')" stroke="#f1f1f6" stroke-width="0.6"/>' +
      '<rect x="3" y="10" width="58" height="4" fill="#d9d9e1" stroke="#f1f1f6" stroke-width="0.6"/>' +
      // frontón
      '<path d="M5 10L32 1L59 10Z" fill="#26262c" stroke="#f1f1f6" stroke-width="0.6" stroke-linejoin="round"/>' +
      '<path d="M12 8.3L32 2.2L52 8.3" fill="none" stroke="#7a7a86" stroke-width="0.4"/>' +
      // visor con sensor
      '<rect x="12" y="17" width="40" height="6" rx="1" fill="#0b0b0d" stroke="#44444c" stroke-width="0.5"/>' +
      '<rect class="sensor" x="14.5" y="19.2" width="7" height="1.6" rx="0.8" fill="#7ee8ff"/>' +
      '<circle class="estado" cx="48.5" cy="20" r="1" fill="#7ee8ff"/>' +
      // cota de medida
      '<path class="cota" pathLength="100" d="M4 70.4H60" fill="none" stroke="#7ee8ff" stroke-width="0.6"/>' +
      '<g class="cota-marcas" stroke="#7ee8ff" stroke-width="0.6"><path d="M4 68.6V72.2M60 68.6V72.2M32 69.4V71.4"/></g>' +
    '</svg>';
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

  /* ── Comportamiento sereno: cada cierto tiempo el visor barre o se traza la cota; nada de saltos ni bailes ── */
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const svg = document.getElementById('mascota-svg');
  const ocupada = new Set();
  function animar(clase, ms) {
    if (ocupada.has(clase)) return;
    ocupada.add(clase);
    svg.classList.add(clase);
    setTimeout(() => { svg.classList.remove(clase); ocupada.delete(clase); }, ms);
  }
  const barrer = () => animar('barre', 2300);
  const medir = () => animar('mide', 3300);

  function accion() {
    if (!document.hidden && !overlay.classList.contains('open')) {
      if (Math.random() < 0.6) barrer(); else medir();
    }
    setTimeout(accion, 7000 + Math.random() * 5000);
  }
  setTimeout(barrer, 1800);
  setTimeout(accion, 9000);
})();

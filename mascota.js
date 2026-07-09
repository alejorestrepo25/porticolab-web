(function () {
  const css = `
    #mascota-wrapper {
      position: fixed;
      bottom: 32px;
      right: 32px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      user-select: none;
    }

    #mascota-label {
      font-family: 'Montserrat', sans-serif;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 2px;
      color: #fff;
      opacity: 0.5;
      text-transform: uppercase;
      transition: opacity 0.3s;
    }

    #mascota-wrapper:hover #mascota-label { opacity: 1; }

    #mascota-svg {
      animation: mascota-float 3.5s ease-in-out infinite;
      filter: drop-shadow(0 0 6px rgba(255,255,255,0.12));
      transition: filter 0.3s;
      overflow: visible;
    }

    #mascota-wrapper:hover #mascota-svg {
      filter: drop-shadow(0 0 18px rgba(255,255,255,0.4));
    }

    @keyframes mascota-float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-7px); }
    }

    .dome-panel {
      animation: dome-pulse 2.8s ease-in-out infinite;
    }
    @keyframes dome-pulse {
      0%, 100% { opacity: 0.06; }
      50%       { opacity: 0.35; }
    }

    .bill-eye-glow {
      animation: eye-glow 1.8s ease-in-out infinite;
    }
    @keyframes eye-glow {
      0%, 100% { opacity: 0.5; }
      50%       { opacity: 1; }
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
    #mascota-modal-overlay.open { display: flex; }

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
    .mascota-btn:hover { background: #222; border-color: #444; }
    .mascota-btn svg { flex-shrink: 0; }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ── Bill Cipher paramétrico ──
     Cuerpo: triángulo (30,14) – (7,68) – (53,68)
     Celosía tipo bambú: grid rotado 45° dentro del triángulo
     Ojo pulsante en (30,41), sombrero arquitectónico,
     brazos tipo arco, piernas columna, pajarita.
  */
  const BILL = `<svg id="mascota-svg" width="58" height="92" viewBox="-2 0 64 92" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Celosía de diamantes -->
    <pattern id="blatice" x="0" y="0" width="7" height="7"
             patternUnits="userSpaceOnUse" patternTransform="rotate(45 30 41)">
      <line x1="0" y1="0" x2="0" y2="7" stroke="#2e2e2e" stroke-width="0.55"/>
      <line x1="0" y1="0" x2="7" y2="0" stroke="#2e2e2e" stroke-width="0.55"/>
    </pattern>
    <!-- Clip del cuerpo triangular -->
    <clipPath id="bill-clip">
      <polygon points="30,14 7,68 53,68"/>
    </clipPath>
    <!-- Clip del sombrero -->
    <clipPath id="hat-clip">
      <rect x="23" y="3" width="14" height="8"/>
    </clipPath>
  </defs>

  <!-- ── SOMBRA SUELO ── -->
  <ellipse cx="30" cy="87" rx="16" ry="2" fill="#111"/>

  <!-- ── PIERNAS ── -->
  <line x1="19" y1="68" x2="14" y2="82" stroke="#4a4a4a" stroke-width="1.4" stroke-linecap="round"/>
  <line x1="41" y1="68" x2="46" y2="82" stroke="#4a4a4a" stroke-width="1.4" stroke-linecap="round"/>
  <!-- Zapatos -->
  <line x1="14" y1="82" x2="9"  y2="81" stroke="#4a4a4a" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="14" y1="82" x2="14" y2="84" stroke="#3a3a3a" stroke-width="0.8"/>
  <line x1="46" y1="82" x2="51" y2="81" stroke="#4a4a4a" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="46" y1="82" x2="46" y2="84" stroke="#3a3a3a" stroke-width="0.8"/>

  <!-- ── PAJARITA ── -->
  <polygon points="22,64 29,67.5 22,71" fill="#1c1c1c" stroke="#3a3a3a" stroke-width="0.6"/>
  <polygon points="38,64 31,67.5 38,71" fill="#1c1c1c" stroke="#3a3a3a" stroke-width="0.6"/>
  <circle cx="30" cy="67.5" r="1.8" fill="#3a3a3a"/>

  <!-- ── CUERPO TRIANGULAR ── -->
  <!-- Fondo oscuro -->
  <polygon points="30,14 7,68 53,68" fill="#0c0c0c"/>
  <!-- Celosía paramétrica de bambú -->
  <rect x="-5" y="0" width="70" height="92" fill="url(#blatice)" clip-path="url(#bill-clip)"/>
  <!-- Paneles con brillo sutil -->
  <polygon class="dome-panel" style="animation-delay:0s"
    points="30,14 19,41 30,38" fill="#fff" opacity="0.08" clip-path="url(#bill-clip)"/>
  <polygon class="dome-panel" style="animation-delay:0.9s"
    points="30,14 41,41 30,38" fill="#fff" opacity="0.06" clip-path="url(#bill-clip)"/>
  <polygon class="dome-panel" style="animation-delay:1.7s"
    points="7,68 19,55 13,68" fill="#fff" opacity="0.07" clip-path="url(#bill-clip)"/>
  <polygon class="dome-panel" style="animation-delay:0.5s"
    points="53,68 41,55 47,68" fill="#fff" opacity="0.07" clip-path="url(#bill-clip)"/>
  <!-- Contorno triángulo -->
  <polygon points="30,14 7,68 53,68" fill="none" stroke="#444" stroke-width="0.9"/>
  <!-- Costilla central -->
  <line x1="30" y1="14" x2="30" y2="68" stroke="#333" stroke-width="0.5" opacity="0.6"/>
  <!-- Costillas laterales -->
  <line x1="30" y1="14" x2="7"  y2="68" stroke="#2a2a2a" stroke-width="0.5" opacity="0.5"/>
  <line x1="30" y1="14" x2="53" y2="68" stroke="#2a2a2a" stroke-width="0.5" opacity="0.5"/>
  <!-- Cinturón horizontal -->
  <line x1="14" y1="50" x2="46" y2="50" stroke="#333" stroke-width="0.5" opacity="0.5"/>
  <line x1="18" y1="35" x2="42" y2="35" stroke="#2a2a2a" stroke-width="0.5" opacity="0.4"/>

  <!-- ── BRAZOS (arcos paramétricos) ── -->
  <path d="M 12,48 C 4,44 1,38 2,32" fill="none" stroke="#4a4a4a" stroke-width="1.3" stroke-linecap="round"/>
  <!-- Mano izquierda (3 dedos) -->
  <line x1="2"  y1="32" x2="-1" y2="29" stroke="#3a3a3a" stroke-width="0.9" stroke-linecap="round"/>
  <line x1="2"  y1="32" x2="2"  y2="28" stroke="#3a3a3a" stroke-width="0.9" stroke-linecap="round"/>
  <line x1="2"  y1="32" x2="5"  y2="30" stroke="#3a3a3a" stroke-width="0.9" stroke-linecap="round"/>

  <path d="M 48,48 C 56,44 59,38 58,32" fill="none" stroke="#4a4a4a" stroke-width="1.3" stroke-linecap="round"/>
  <!-- Mano derecha -->
  <line x1="58" y1="32" x2="61" y2="29" stroke="#3a3a3a" stroke-width="0.9" stroke-linecap="round"/>
  <line x1="58" y1="32" x2="58" y2="28" stroke="#3a3a3a" stroke-width="0.9" stroke-linecap="round"/>
  <line x1="58" y1="32" x2="55" y2="30" stroke="#3a3a3a" stroke-width="0.9" stroke-linecap="round"/>

  <!-- ── OJO ── -->
  <!-- Esclerótica -->
  <circle cx="30" cy="41" r="9" fill="#080808" stroke="#555" stroke-width="0.7"/>
  <!-- Anillo exterior pulsante -->
  <circle class="bill-eye-glow" cx="30" cy="41" r="8.5" fill="none" stroke="#fff" stroke-width="0.4" opacity="0.4"/>
  <!-- Iris -->
  <ellipse cx="30" cy="41" rx="5.5" ry="6" fill="#0a0a0a"/>
  <ellipse cx="30" cy="41" rx="5.5" ry="6" fill="none" stroke="#666" stroke-width="0.5"/>
  <!-- Pupila -->
  <circle class="bill-eye-glow" cx="30" cy="41" r="2.8" fill="#fff" opacity="0.9"/>
  <circle cx="30" cy="41" r="1.4" fill="#fff"/>

  <!-- ── SONRISA ── -->
  <polyline points="20,53 23,50 26,54 29,51 33,55 37,51 40,54 43,51"
    fill="none" stroke="#666" stroke-width="0.85" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- ── SOMBRERO ── -->
  <!-- Corona con celosía -->
  <rect x="23" y="3" width="14" height="9" rx="0.5" fill="#0c0c0c" stroke="#3a3a3a" stroke-width="0.6"/>
  <rect x="23" y="3" width="14" height="9" fill="url(#blatice)" clip-path="url(#hat-clip)"/>
  <rect x="23" y="3" width="14" height="9" fill="none" stroke="#3a3a3a" stroke-width="0.6"/>
  <!-- Franja del sombrero -->
  <rect x="23" y="9" width="14" height="2" fill="#1a1a1a" stroke="#2a2a2a" stroke-width="0.4"/>
  <!-- Ala del sombrero -->
  <rect x="17" y="11" width="26" height="4" rx="0.5" fill="#0c0c0c" stroke="#3a3a3a" stroke-width="0.7"/>
</svg>`;

  const BILL_MODAL = `<svg width="46" height="70" viewBox="-2 0 64 92" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="blatice-m" x="0" y="0" width="7" height="7"
             patternUnits="userSpaceOnUse" patternTransform="rotate(45 30 41)">
      <line x1="0" y1="0" x2="0" y2="7" stroke="#2e2e2e" stroke-width="0.55"/>
      <line x1="0" y1="0" x2="7" y2="0" stroke="#2e2e2e" stroke-width="0.55"/>
    </pattern>
    <clipPath id="bill-clip-m"><polygon points="30,14 7,68 53,68"/></clipPath>
    <clipPath id="hat-clip-m"><rect x="23" y="3" width="14" height="8"/></clipPath>
  </defs>
  <!-- Piernas -->
  <line x1="19" y1="68" x2="14" y2="80" stroke="#4a4a4a" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="41" y1="68" x2="46" y2="80" stroke="#4a4a4a" stroke-width="1.2" stroke-linecap="round"/>
  <line x1="14" y1="80" x2="9" y2="79" stroke="#4a4a4a" stroke-width="1" stroke-linecap="round"/>
  <line x1="46" y1="80" x2="51" y2="79" stroke="#4a4a4a" stroke-width="1" stroke-linecap="round"/>
  <!-- Pajarita -->
  <polygon points="22,64 29,67.5 22,71" fill="#1c1c1c" stroke="#3a3a3a" stroke-width="0.6"/>
  <polygon points="38,64 31,67.5 38,71" fill="#1c1c1c" stroke="#3a3a3a" stroke-width="0.6"/>
  <circle cx="30" cy="67.5" r="1.8" fill="#3a3a3a"/>
  <!-- Cuerpo -->
  <polygon points="30,14 7,68 53,68" fill="#0c0c0c"/>
  <rect x="-5" y="0" width="70" height="92" fill="url(#blatice-m)" clip-path="url(#bill-clip-m)"/>
  <polygon points="30,14 7,68 53,68" fill="none" stroke="#444" stroke-width="0.9"/>
  <line x1="30" y1="14" x2="30" y2="68" stroke="#333" stroke-width="0.5" opacity="0.6"/>
  <!-- Ojo -->
  <circle cx="30" cy="41" r="9" fill="#080808" stroke="#555" stroke-width="0.7"/>
  <ellipse cx="30" cy="41" rx="5.5" ry="6" fill="#0a0a0a"/>
  <ellipse cx="30" cy="41" rx="5.5" ry="6" fill="none" stroke="#666" stroke-width="0.5"/>
  <circle cx="30" cy="41" r="2.8" fill="#fff" opacity="0.9"/>
  <circle cx="30" cy="41" r="1.4" fill="#fff"/>
  <!-- Sonrisa -->
  <polyline points="20,53 23,50 26,54 29,51 33,55 37,51 40,54 43,51"
    fill="none" stroke="#666" stroke-width="0.85" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Sombrero -->
  <rect x="23" y="3" width="14" height="9" rx="0.5" fill="#0c0c0c" stroke="#3a3a3a" stroke-width="0.6"/>
  <rect x="23" y="3" width="14" height="9" fill="url(#blatice-m)" clip-path="url(#hat-clip-m)"/>
  <rect x="23" y="3" width="14" height="9" fill="none" stroke="#3a3a3a" stroke-width="0.6"/>
  <rect x="23" y="9" width="14" height="2" fill="#1a1a1a" stroke="#2a2a2a" stroke-width="0.4"/>
  <rect x="17" y="11" width="26" height="4" rx="0.5" fill="#0c0c0c" stroke="#3a3a3a" stroke-width="0.7"/>
</svg>`;

  const wrapper = document.createElement('div');
  wrapper.id = 'mascota-wrapper';
  wrapper.innerHTML = BILL + `<span id="mascota-label">Contacto</span>`;

  const overlay = document.createElement('div');
  overlay.id = 'mascota-modal-overlay';
  overlay.innerHTML = `
    <div id="mascota-modal">
      <button id="mascota-modal-close">&#x2715;</button>
      ${BILL_MODAL}
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

  wrapper.addEventListener('click', () => overlay.classList.add('open'));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
  document.getElementById('mascota-modal-close').addEventListener('click', () => {
    overlay.classList.remove('open');
  });
})();

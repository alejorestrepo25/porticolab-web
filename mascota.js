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

    #mascota-wrapper:hover #mascota-label {
      opacity: 1;
    }

    #mascota-svg {
      animation: mascota-float 3s ease-in-out infinite;
      filter: drop-shadow(0 0 6px rgba(255,255,255,0.15));
      transition: filter 0.3s;
    }

    #mascota-wrapper:hover #mascota-svg {
      filter: drop-shadow(0 0 14px rgba(255,255,255,0.5));
    }

    @keyframes mascota-float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-8px); }
    }

    .panel-glow {
      animation: panel-pulse 2.5s ease-in-out infinite;
    }
    .panel-glow:nth-child(2) { animation-delay: 0.4s; }
    .panel-glow:nth-child(3) { animation-delay: 0.8s; }
    .panel-glow:nth-child(4) { animation-delay: 1.2s; }
    .panel-glow:nth-child(5) { animation-delay: 1.6s; }

    @keyframes panel-pulse {
      0%, 100% { opacity: 0.25; }
      50%       { opacity: 0.75; }
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

  // Edificio paramétrico SVG
  const wrapper = document.createElement('div');
  wrapper.id = 'mascota-wrapper';
  wrapper.innerHTML = `
    <svg id="mascota-svg" width="54" height="80" viewBox="0 0 54 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- base -->
      <rect x="8" y="70" width="38" height="6" rx="1" fill="#333"/>
      <!-- cuerpo principal -->
      <polygon points="27,4 46,18 46,70 8,70 8,18" fill="#1a1a1a" stroke="#444" stroke-width="0.8"/>
      <!-- fachada paramétrica: paneles diagonales -->
      <polygon class="panel-glow" points="27,4 38,11 30,22 19,15" fill="#fff" opacity="0.25"/>
      <polygon class="panel-glow" points="38,11 46,18 37,30 30,22" fill="#fff" opacity="0.25"/>
      <polygon class="panel-glow" points="19,15 30,22 22,35 13,27" fill="#fff" opacity="0.25"/>
      <polygon class="panel-glow" points="30,22 37,30 29,42 22,35" fill="#fff" opacity="0.25"/>
      <polygon class="panel-glow" points="37,30 46,38 38,50 29,42" fill="#fff" opacity="0.25"/>
      <!-- líneas de grilla -->
      <line x1="8" y1="38" x2="46" y2="38" stroke="#333" stroke-width="0.5"/>
      <line x1="8" y1="54" x2="46" y2="54" stroke="#333" stroke-width="0.5"/>
      <line x1="27" y1="4"  x2="27" y2="70" stroke="#333" stroke-width="0.5"/>
      <!-- antena -->
      <line x1="27" y1="4" x2="27" y2="0" stroke="#fff" stroke-width="1" opacity="0.6"/>
      <circle cx="27" cy="0" r="1.5" fill="#fff" opacity="0.8"/>
    </svg>
    <span id="mascota-label">Contacto</span>
  `;

  // Modal
  const overlay = document.createElement('div');
  overlay.id = 'mascota-modal-overlay';
  overlay.innerHTML = `
    <div id="mascota-modal">
      <button id="mascota-modal-close">&#x2715;</button>

      <svg width="36" height="54" viewBox="0 0 54 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="27,4 46,18 46,70 8,70 8,18" fill="#1a1a1a" stroke="#555" stroke-width="0.8"/>
        <polygon points="27,4 38,11 30,22 19,15" fill="#fff" opacity="0.35"/>
        <polygon points="38,11 46,18 37,30 30,22" fill="#fff" opacity="0.35"/>
        <polygon points="19,15 30,22 22,35 13,27" fill="#fff" opacity="0.35"/>
        <line x1="27" y1="4" x2="27" y2="0" stroke="#fff" stroke-width="1" opacity="0.6"/>
        <circle cx="27" cy="0" r="1.5" fill="#fff" opacity="0.8"/>
      </svg>

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

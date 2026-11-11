(() => {
  const section = document.getElementById('pinterest-board');
  if (!section) return;

  const rawUrl = (section.dataset.boardUrl || '').trim();
  if (!rawUrl) return;

  let boardUrl;
  try {
    boardUrl = new URL(rawUrl);
  } catch {
    return;
  }

  if (boardUrl.protocol !== 'https:' || !/(^|\.)pinterest\.com$/i.test(boardUrl.hostname)) return;
  boardUrl.search = '';
  boardUrl.hash = '';
  // Acepta un tablero (/usuario/tablero/) o el perfil (/usuario/ o /usuario/_saved/)
  const partes = boardUrl.pathname.split('/').filter(Boolean);
  if (!partes.length || partes.length > 2) return;
  const esPerfil = partes.length === 1 || /^_(saved|created|profile)$/.test(partes[1]);
  boardUrl.pathname = esPerfil ? `/${partes[0]}/` : `/${partes[0]}/${partes[1]}/`;

  const anchor = document.createElement('a');
  anchor.dataset.pinDo = esPerfil ? 'embedUser' : 'embedBoard';
  section.hidden = false;
  anchor.dataset.pinBoardWidth = String(Math.max(320, Math.floor(section.getBoundingClientRect().width)));
  anchor.dataset.pinScaleHeight = '520';
  anchor.dataset.pinScaleWidth = '100';
  anchor.href = boardUrl.href;
  anchor.textContent = esPerfil ? 'Ver Pórtico Lab en Pinterest' : 'Ver tablero en Pinterest';
  section.querySelector('.pinterest-board__embed').appendChild(anchor);
  const enlace = section.querySelector('.pinterest-board__link');
  if (enlace) enlace.href = boardUrl.href;

  // Pinterest instala sus propias cookies: solo se carga si la persona aceptó las cookies opcionales
  const permitido = () => { try { const c = JSON.parse(localStorage.getItem('pl_consent') || 'null'); return !!(c && c.analitica); } catch (e) { return false; } };
  let loaded = false;
  const loadPinterest = () => {
    if (loaded) return;
    if (!permitido()) { document.addEventListener('pl:consent', () => { if (permitido()) loadPinterest(); }, { once: true }); return; }
    loaded = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://assets.pinterest.com/js/pinit.js';
    script.onerror = () => {
      anchor.textContent = 'No se pudo cargar Pinterest. Abra el tablero en una pestaña nueva.';
    };
    document.body.appendChild(script);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      loadPinterest();
    }, { rootMargin: '300px 0px' });
    observer.observe(section);
  } else {
    loadPinterest();
  }
})();

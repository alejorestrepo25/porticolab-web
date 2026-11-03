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
  const boardPath = boardUrl.pathname.replace(/\/+$/, '');
  if (!/^\/[^/]+\/[^/]+$/.test(boardPath)) return;
  boardUrl.pathname = `${boardPath}/`;

  const anchor = document.createElement('a');
  anchor.dataset.pinDo = 'embedBoard';
  section.hidden = false;
  anchor.dataset.pinBoardWidth = String(Math.max(320, Math.floor(section.getBoundingClientRect().width)));
  anchor.dataset.pinScaleHeight = '520';
  anchor.dataset.pinScaleWidth = '100';
  anchor.href = boardUrl.href;
  anchor.textContent = 'Ver tablero en Pinterest';
  section.querySelector('.pinterest-board__embed').appendChild(anchor);
  section.querySelector('.pinterest-board__link').href = boardUrl.href;

  let loaded = false;
  const loadPinterest = () => {
    if (loaded) return;
    loaded = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://assets.pinterest.com/js/pinit.js';
    script.onerror = () => {
      anchor.textContent = 'No se pudo cargar Pinterest. Abre el tablero en una pestaña nueva.';
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

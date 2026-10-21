(() => {
  const path = (value) => {
    const url = new URL(value, location.href);
    return url.pathname.replace(/\/+$/, '') || '/';
  };
  const current = path(location.href);
  const logo = document.querySelector('header .logo[href]');
  if (logo && (current === '/' || current.endsWith('/index.html'))) logo.setAttribute('aria-current', 'page');
  const links = [...document.querySelectorAll('header .nav a[href]')];
  let active = null;

  for (const link of links) {
    link.removeAttribute('aria-current');
    link.classList.remove('activo');
    if (path(link.href) === current) active = link;
  }

  if (!active) return;
  active.setAttribute('aria-current', 'page');
  active.classList.add('activo');

  const nav = active.closest('.nav');
  if (nav && matchMedia('(max-width: 768px)').matches) {
    const left = active.offsetLeft - (nav.clientWidth - active.clientWidth) / 2;
    nav.scrollLeft = Math.max(0, left);
  }
})();

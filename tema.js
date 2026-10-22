(() => {
  const key = 'portico-theme';
  let theme = 'dark';
  try { theme = localStorage.getItem(key) === 'light' ? 'light' : 'dark'; } catch (_) {}
  document.documentElement.dataset.theme = theme;
  const sync = () => document.querySelectorAll('.theme-toggle').forEach((button) => {
    const next = theme === 'dark' ? 'light' : 'dark';
    const name = next === 'light' ? 'claro' : 'oscuro';
    button.setAttribute('aria-label', `Cambiar a tema ${name}`);
    button.setAttribute('title', `Cambiar a tema ${name}`);
    button.setAttribute('aria-pressed', String(theme === 'light'));
    const label = button.querySelector('.theme-toggle__label');
    if (label) label.textContent = next === 'light' ? 'Claro' : 'Oscuro';
    button.querySelectorAll('[data-theme-icon]').forEach(icon => { icon.hidden = icon.dataset.themeIcon !== next; });
  });
  const init = () => {
    sync();
    document.querySelectorAll('.theme-toggle').forEach(button => button.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = theme;
      try { localStorage.setItem(key, theme); } catch (_) {}
      sync();
    }));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
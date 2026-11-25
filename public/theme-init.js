(function () {
  var stored;
  try {
    stored = localStorage.getItem('fj-theme');
  } catch {
    stored = null;
  }
  var dark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.body.classList.remove('theme-light', 'theme-dark');
  document.body.classList.add(dark ? 'theme-dark' : 'theme-light');
})();

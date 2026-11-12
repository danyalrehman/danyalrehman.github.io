// Blog head setup, run before first paint. Must load before the MathJax CDN script.

document.documentElement.classList.add('js');

// Mark view-transition-capable browsers so the CSS hands page fades over to the
// native cross-document morph. Set before paint so html.js:not(.vt) resolves right.
if (window.CSS && CSS.supports && CSS.supports('view-transition-name: none')) {
  document.documentElement.classList.add('vt');
}

// Apply the saved theme before paint. Without a saved choice the site loads in
// light mode, whatever the OS setting; this must match index.html's bootstrap
// or the theme would change between pages.
// localStorage throws (not returns null) when storage is blocked — e.g. Safari
// "Block All Cookies" or enterprise policy. Unguarded, that would abort this
// script and leave window.MathJax unset, so no math renders anywhere.
try {
  if (localStorage.getItem('dark-mode') === 'on') {
    document.documentElement.classList.add('dark-mode');
  }
} catch (_) { /* storage blocked: stay light */ }

window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']]
  },
  svg: { fontCache: 'global' },
  options: { renderActions: { addMenu: [] } }
};

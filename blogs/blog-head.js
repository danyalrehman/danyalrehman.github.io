// Must load before the MathJax CDN script.
document.documentElement.classList.add('js');

// Mark view-transition-capable browsers so the CSS hands page fades over to the
// native cross-document morph. Set before paint so html.js:not(.vt) resolves right.
if (window.CSS && CSS.supports && CSS.supports('view-transition-name: none')) {
  document.documentElement.classList.add('vt');
}

// localStorage throws (not returns null) when storage is blocked — e.g. Safari
// "Block All Cookies" or enterprise policy. Unguarded, that would abort this
// script and leave window.MathJax unset, so no math renders anywhere.
// With no stored preference, follow the operating-system setting — this must
// match index.html's bootstrap or the theme would change between pages.
let storedTheme = null;
try {
  storedTheme = localStorage.getItem('dark-mode');
} catch (_) { /* storage unavailable — fall back to the OS preference */ }

const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
if (storedTheme === 'on' || (storedTheme === null && prefersDark)) {
  document.documentElement.classList.add('dark-mode');
}

window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']]
  },
  svg: { fontCache: 'global' },
  options: { renderActions: { addMenu: [] } }
};

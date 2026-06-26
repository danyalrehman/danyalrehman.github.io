// Must load before the MathJax CDN script.
document.documentElement.classList.add('js');
if (localStorage.getItem('dark-mode') === 'on') {
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

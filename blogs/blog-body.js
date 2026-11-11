// Blog-only interactions; the site chrome shared with the homepage (theme and
// background toggles, sticky nav, back-to-top) lives in /site.js.
//  1. Local file:// preview: point the clean "../../" home links at index.html.
//  2. Copy buttons for the citation box and the hero's BibTeX button.

// Off disk, "../../" resolves to a bare directory (a file listing) instead of
// the homepage. The deployed site, served over http(s), keeps the clean root
// URLs untouched.
if (location.protocol === 'file:') {
  document.querySelectorAll('a[href^="../../"]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === '../../' || href.startsWith('../../#')) {
      a.setAttribute('href', '../../index.html' + href.slice(6));
    }
  });
}

(() => {
  const pre = document.getElementById('bib-content');
  if (!pre) return;

  // For browsers without the async Clipboard API (or when it is refused).
  const fallbackCopy = (text) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (_) { /* nothing more to try */ }
    document.body.removeChild(ta);
  };

  const flash = (btn, copiedHTML) => {
    if (btn.dataset.flashing === '1') return;
    btn.dataset.flashing = '1';
    const original = btn.innerHTML;
    btn.innerHTML = copiedHTML;
    setTimeout(() => {
      btn.innerHTML = original;
      delete btn.dataset.flashing;
    }, 1500);
  };

  const doCopy = (btn, copiedHTML) => {
    const text = pre.textContent;
    const after = () => flash(btn, copiedHTML);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(after).catch(() => { fallbackCopy(text); after(); });
    } else {
      fallbackCopy(text);
      after();
    }
  };

  const sideBtn = document.getElementById('bib-copy');
  if (sideBtn) {
    sideBtn.addEventListener('click', () => doCopy(sideBtn, '<i class="fas fa-check" aria-hidden="true"></i> Copied!'));
  }

  document.querySelectorAll('.paper-btn-bib-copy').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      doCopy(btn, '<i class="fas fa-check" aria-hidden="true"></i> Copied!');
    });
  });
})();

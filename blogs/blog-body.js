requestAnimationFrame(() => document.body.classList.add('is-ready'));

// localStorage throws (not returns null) when storage is blocked — e.g. Safari
// "Block All Cookies" or enterprise policy. These wrappers keep a throw from
// aborting the file, which would take the nav, progress bar and toggles with it.
const store = {
  get(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch (_) { /* preference not persisted */ }
  },
};

// Local file:// preview only: the clean "../../" home links resolve to a bare
// directory off disk (a file listing) instead of the homepage. Point them at
// index.html so preview navigates correctly — the deployed site, served over
// http(s), keeps the clean root URL untouched.
if (location.protocol === 'file:') {
  document.querySelectorAll('a[href^="../../"]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === '../../' || href.startsWith('../../#')) {
      a.setAttribute('href', '../../index.html' + href.slice(6));
    }
  });
}

(() => {
  const bgBtn = document.getElementById('bg-toggle');
  const content = document.querySelector('.content');
  if (bgBtn && content) {
    if (store.get('bg-image') === 'on') content.setAttribute('data-bg', 'on');
    bgBtn.addEventListener('click', () => {
      const on = content.getAttribute('data-bg') === 'on';
      content.setAttribute('data-bg', on ? 'off' : 'on');
      store.set('bg-image', on ? 'off' : 'on');
    });
  }
  const darkBtn = document.getElementById('dark-toggle');
  const darkIcon = darkBtn?.querySelector('i');
  if (darkBtn && darkIcon) {
    const reduceMo = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    // Thermodynamic framing: light = "hot", dark = "cold" — cool down / heat up.
    const setThermo = (dark, animate) => {
      darkIcon.className = dark ? 'fas fa-sun' : 'fas fa-snowflake';
      darkBtn.setAttribute('aria-label', dark ? 'Warm up to light mode' : 'Cool down to dark mode');
      darkBtn.setAttribute('title', dark ? 'Warm up' : 'Cool down');
      if (animate && !reduceMo) { void darkIcon.offsetWidth; darkIcon.classList.add('thermo-flip'); }
    };
    setThermo(document.documentElement.classList.contains('dark-mode'), false);
    darkBtn.addEventListener('click', () => {
      const on = document.documentElement.classList.toggle('dark-mode');
      setThermo(on, true);
      store.set('dark-mode', on ? 'on' : 'off');
    });
  }
})();

(() => {
  const nav = document.getElementById('sticky-nav');
  const navInner = document.querySelector('.sticky-nav-inner');
  const progress = document.querySelector('.nav-progress');
  const progressPath = progress?.querySelector('path');

  // Path traces the pill's lower silhouette. Stroke centerline is inset by
  // STROKE/2 so the stroke's outer edge aligns with the pill's outer curve.
  // sweep-flag=0 hugs the pill's cap center (sweep-flag=1 would bulge out).
  const STROKE = 1.5;
  const HALF = STROKE / 2;
  const rebuildPath = () => {
    if (!navInner || !progress || !progressPath) return;
    const { width: W, height: H } = navInner.getBoundingClientRect();
    if (W < 4 || H < 4) return;
    const rad = H / 2;
    const innerRad = rad - HALF;
    const wrap = Math.PI / 4;
    const dx = innerRad * Math.sin(wrap);
    const dy = innerRad * Math.cos(wrap);
    const x1 = rad - dx, y1 = rad + dy;
    const x2 = W - rad + dx;
    const yBot = H - HALF;
    progressPath.setAttribute(
      'd',
      `M ${x1.toFixed(2)} ${y1.toFixed(2)} ` +
      `A ${innerRad.toFixed(2)} ${innerRad.toFixed(2)} 0 0 0 ${rad.toFixed(2)} ${yBot.toFixed(2)} ` +
      `L ${(W - rad).toFixed(2)} ${yBot.toFixed(2)} ` +
      `A ${innerRad.toFixed(2)} ${innerRad.toFixed(2)} 0 0 0 ${x2.toFixed(2)} ${y1.toFixed(2)}`
    );
    progress.setAttribute('viewBox', `0 0 ${W.toFixed(2)} ${H.toFixed(2)}`);
  };

  if (navInner && progress && typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(rebuildPath).observe(navInner);
  }

  let ticking = false;
  const update = () => {
    const doc = document.documentElement;
    const scrollTop = Math.max(window.scrollY || 0, doc.scrollTop || 0, document.body.scrollTop || 0);
    const fullH = Math.max(doc.scrollHeight, document.body.scrollHeight, doc.offsetHeight);
    const max = fullH - (doc.clientHeight || window.innerHeight);
    const val = max > 0 ? scrollTop / max : 0;
    if (progress) progress.style.setProperty('--p', Math.min(1, Math.max(0, val)));
    nav?.classList.toggle('is-scrolled', scrollTop > 8);
    ticking = false;
  };
  const requestTick = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);
  window.addEventListener('load', () => {
    rebuildPath(); update();
    document.querySelectorAll('img').forEach((img) => {
      if (!img.complete) img.addEventListener('load', requestTick, { once: true });
    });
  });
  document.addEventListener('readystatechange', requestTick);
  document.fonts?.ready?.then(requestTick);

  rebuildPath();
  update();
})();

(() => {
  const navLinks = document.querySelector('.sticky-nav-links');
  if (!navLinks) return;
  const links = Array.from(navLinks.querySelectorAll('a:not(.nav-blog-item)'));
  if (!links.length) return;

  const pill = document.createElement('span');
  pill.className = 'sticky-nav-pill';
  pill.setAttribute('aria-hidden', 'true');
  navLinks.prepend(pill);

  const getActive = () => links.find((l) => l.classList.contains('is-active')) || null;

  const moveTo = (link, { animate = true } = {}) => {
    if (!link) { pill.classList.remove('is-visible'); return; }
    const navRect = navLinks.getBoundingClientRect();
    const r = link.getBoundingClientRect();
    if (!animate) { pill.style.transition = 'none'; void pill.offsetWidth; }
    pill.style.transform = `translate(${r.left - navRect.left}px, ${r.top - navRect.top}px)`;
    pill.style.width = `${r.width}px`;
    pill.style.height = `${r.height}px`;
    if (!animate) requestAnimationFrame(() => { pill.style.transition = ''; });
    pill.classList.add('is-visible');
  };

  const settle = () => moveTo(getActive());
  requestAnimationFrame(() => moveTo(getActive(), { animate: false }));

  links.forEach((link) => {
    link.addEventListener('mouseenter', () => moveTo(link));
    link.addEventListener('focus', () => moveTo(link));
  });
  navLinks.addEventListener('mouseleave', settle);
  navLinks.addEventListener('focusout', (e) => {
    if (!navLinks.contains(e.relatedTarget)) settle();
  });

  let resizeTimer = 0;
  const reflow = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => moveTo(getActive(), { animate: false }), 80);
  };
  window.addEventListener('resize', reflow);
  window.addEventListener('load', reflow);
})();

(() => {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    btn.classList.toggle('is-visible', window.scrollY > 600);
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
  btn.addEventListener('click', () => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
})();

(() => {
  const pre = document.getElementById('bib-content');
  if (!pre) return;

  const fallbackCopy = (text) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (_) {}
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
    sideBtn.addEventListener('click', () => doCopy(sideBtn, '<i class="fas fa-check"></i> Copied!'));
  }

  document.querySelectorAll('.paper-btn-bib-copy').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      doCopy(btn, '<i class="fas fa-check" aria-hidden="true"></i> Copied!');
    });
  });
})();

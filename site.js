// Site chrome shared by the homepage and every blog post. Loaded right after
// the sticky nav, so the theme icon is correct before the nav first paints;
// everything that needs the rest of the page waits for the DOM.
//  1. Page-ready fade-in (body.is-ready).
//  2. Dark-mode ("cool down" / "warm up") and background-image toggles.
//  3. Sticky nav: scroll progress, scrolled state, active section, the sliding
//     highlight pill, and smooth scrolling for in-page links.
//  4. Back-to-top button.

(() => {
  // localStorage throws (not returns null) when storage is blocked — e.g.
  // Safari "Block All Cookies" or enterprise policy — so every access is guarded.
  const store = {
    get(key) {
      try { return localStorage.getItem(key); } catch (_) { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch (_) { /* not persisted */ }
    },
  };
  const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const scrollBehavior = () => (reducedMotion() ? 'auto' : 'smooth');

  requestAnimationFrame(() => document.body.classList.add('is-ready'));

  // ---- Theme toggle ----
  // Thermodynamic framing: light = "hot", dark = "cold". The control cools the
  // page down or heats it back up; the icon shows the state you switch to.
  const initTheme = () => {
    const btn = document.getElementById('dark-toggle');
    const icon = btn?.querySelector('i');
    if (!btn || !icon) return;
    const show = (dark, animate) => {
      icon.className = dark ? 'fas fa-sun' : 'fas fa-snowflake';
      btn.setAttribute('aria-label', dark ? 'Warm up to light mode' : 'Cool down to dark mode');
      btn.setAttribute('title', dark ? 'Warm up' : 'Cool down');
      if (animate && !reducedMotion()) {
        void icon.offsetWidth;   // restart the flip animation
        icon.classList.add('thermo-flip');
      }
    };
    show(document.documentElement.classList.contains('dark-mode'), false);
    btn.addEventListener('click', () => {
      const dark = document.documentElement.classList.toggle('dark-mode');
      show(dark, true);
      store.set('dark-mode', dark ? 'on' : 'off');
    });
  };

  // ---- Background-image toggle ----
  const initBackground = () => {
    const btn = document.getElementById('bg-toggle');
    const content = document.querySelector('.content');
    if (!btn || !content) return;
    if (store.get('bg-image') === 'on') content.setAttribute('data-bg', 'on');
    btn.addEventListener('click', () => {
      const on = content.getAttribute('data-bg') === 'on';
      content.setAttribute('data-bg', on ? 'off' : 'on');
      store.set('bg-image', on ? 'off' : 'on');
    });
  };

  // ---- Sticky nav ----
  const initNav = () => {
    const nav = document.getElementById('sticky-nav');
    if (!nav) return;
    const navInner = nav.querySelector('.sticky-nav-inner');
    const navLinks = nav.querySelector('.sticky-nav-links');
    const progress = nav.querySelector('.nav-progress');
    const progressPath = progress?.querySelector('path');

    // In-page links scroll smoothly; "About" is the top of the page. (Blog
    // posts link back to the homepage's sections, so this is homepage-only.)
    nav.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const hash = link.getAttribute('href');
        if (hash === '#' || hash === '#about') {
          window.scrollTo({ top: 0, behavior: scrollBehavior() });
          return;
        }
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
      });
    });

    // The progress stroke traces the pill's lower silhouette. Its centerline is
    // inset by half the stroke so the outer edge sits on the pill's curve, and
    // sweep-flag 0 hugs the end caps (1 would bulge outward).
    const STROKE = 1.5;
    const HALF = STROKE / 2;
    const rebuildProgressPath = () => {
      if (!navInner || !progressPath) return;
      const { width: W, height: H } = navInner.getBoundingClientRect();
      if (W < 4 || H < 4) return;
      const rad = H / 2;
      const innerRad = rad - HALF;
      const wrap = Math.PI / 4;
      const dx = innerRad * Math.sin(wrap);
      const dy = innerRad * Math.cos(wrap);
      const x1 = rad - dx;
      const y1 = rad + dy;
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
    if (navInner && progressPath && typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(rebuildProgressPath).observe(navInner);
    }

    // Links to sections of this page, for highlighting the one in view.
    const sectionLinks = navLinks ? Array.from(navLinks.querySelectorAll('a[href^="#"]')) : [];
    const sections = sectionLinks
      .map((link) => {
        const el = document.getElementById(link.getAttribute('href').slice(1));
        return el ? { el, link } : null;
      })
      .filter(Boolean);

    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const scrollTop = Math.max(window.scrollY || 0, doc.scrollTop || 0, document.body.scrollTop || 0);
      const fullH = Math.max(doc.scrollHeight, document.body.scrollHeight, doc.offsetHeight);
      const max = fullH - (doc.clientHeight || window.innerHeight);
      const val = max > 0 ? scrollTop / max : 0;
      progress?.style.setProperty('--p', Math.min(1, Math.max(0, val)));
      nav.classList.toggle('is-scrolled', scrollTop > 8);

      if (sections.length) {
        let current = null;
        for (const section of sections) {
          if (section.el.getBoundingClientRect().top <= 140) current = section;
        }
        if (scrollTop < 80) current = null;
        sectionLinks.forEach((l) => l.classList.remove('is-active'));
        current?.link.classList.add('is-active');
      }
      ticking = false;
    };
    const requestTick = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', () => {
      rebuildProgressPath();
      requestTick();
    });
    window.addEventListener('load', () => {
      rebuildProgressPath();
      update();
      // Lazy images that arrive later still change the page height.
      document.querySelectorAll('img').forEach((img) => {
        if (!img.complete) img.addEventListener('load', requestTick, { once: true });
      });
    });
    document.fonts?.ready?.then(requestTick);
    rebuildProgressPath();
    update();

    if (navLinks) initPill(navLinks);
  };

  // The highlight pill slides to whichever link is hovered or focused and
  // otherwise rests on the active one (or hides when there is none).
  const initPill = (navLinks) => {
    const links = Array.from(navLinks.querySelectorAll('a:not(.nav-blog-item)'));
    if (!links.length) return;

    const pill = document.createElement('span');
    pill.className = 'sticky-nav-pill';
    pill.setAttribute('aria-hidden', 'true');
    navLinks.prepend(pill);

    const getActive = () => links.find((l) => l.classList.contains('is-active')) || null;

    // A clicked link holds the pill while its smooth scroll passes other sections.
    let lockedLink = null;
    let lockTimer = 0;

    const moveTo = (link, { animate = true } = {}) => {
      if (!link) {
        pill.classList.remove('is-visible');
        return;
      }
      const navRect = navLinks.getBoundingClientRect();
      const r = link.getBoundingClientRect();
      if (!animate) {
        pill.style.transition = 'none';
        void pill.offsetWidth;
      }
      pill.style.transform = `translate(${r.left - navRect.left}px, ${r.top - navRect.top}px)`;
      pill.style.width = `${r.width}px`;
      pill.style.height = `${r.height}px`;
      if (!animate) requestAnimationFrame(() => { pill.style.transition = ''; });
      pill.classList.add('is-visible');
    };
    const settleToActive = () => moveTo(getActive());

    requestAnimationFrame(() => moveTo(getActive(), { animate: false }));

    links.forEach((link) => {
      link.addEventListener('mouseenter', () => moveTo(link));
      link.addEventListener('focus', () => moveTo(link));
      link.addEventListener('click', () => {
        lockedLink = link;
        moveTo(link);
        clearTimeout(lockTimer);
        lockTimer = setTimeout(() => { lockedLink = null; }, 700);
      });
    });
    navLinks.addEventListener('mouseleave', settleToActive);
    navLinks.addEventListener('focusout', (e) => {
      if (!navLinks.contains(e.relatedTarget)) settleToActive();
    });

    // Follow the active section as the page scrolls, unless the pointer is in
    // the nav or a click is holding the pill.
    const observer = new MutationObserver(() => {
      if (lockedLink || navLinks.matches(':hover')) return;
      settleToActive();
    });
    links.forEach((link) => observer.observe(link, { attributes: true, attributeFilter: ['class'] }));

    let resizeTimer = 0;
    const reflow = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => moveTo(lockedLink || getActive(), { animate: false }), 80);
    };
    window.addEventListener('resize', reflow);
    window.addEventListener('load', reflow);
  };

  // ---- Back to top ----
  const initBackToTop = () => {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      btn.classList.toggle('is-visible', window.scrollY > 600);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: scrollBehavior() }));
  };

  initTheme();
  const initRest = () => {
    initBackground();
    initNav();
    initBackToTop();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initRest, { once: true });
  else initRest();
})();

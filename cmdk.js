// Shared across the homepage and every blog post.
//  1. Fade-out transition for internal links marked with `data-fade-link`.
//  2. The ⌘K / Ctrl-K / "/" command palette.
//
// Each page supplies its own results via a JSON block:
//   <script type="application/json" id="cmdk-data">[ { ...item }, ... ]</script>
// where an item is { group, title, icon, keywords?, subtitle?, scroll? | url? }.
// `scroll` smooth-scrolls to an element id on the current page; `url` opens a
// link (mailto / external in a new tab / internal in place).

(() => {
  // ---- Page-transition fade for internal links ----
  document.querySelectorAll('a[data-fade-link]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      document.body.classList.add('is-leaving');
      setTimeout(() => { window.location.href = href; }, 320);
    });
  });

  // ---- Command palette ----
  const modal   = document.getElementById('cmdk');
  const input   = document.getElementById('cmdk-input');
  const listEl  = document.getElementById('cmdk-list');
  const emptyEl = document.getElementById('cmdk-empty');
  const openBtn = document.getElementById('cmdk-open');
  if (!modal || !input || !listEl) return;

  const dataEl = document.getElementById('cmdk-data');
  let items = [];
  if (dataEl) {
    try { items = JSON.parse(dataEl.textContent); } catch (_) { items = []; }
  }
  if (!items.length) return;

  const scrollToId = (id) => {
    if (id === 'about') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  items.forEach((it) => {
    it._hay = `${it.title} ${it.subtitle ?? ''} ${it.keywords ?? ''} ${it.group}`.toLowerCase();
  });

  let filtered = items.slice();
  let activeIndex = 0;

  const score = (item, tokens) => {
    let total = 0;
    for (const token of tokens) {
      const idx = item._hay.indexOf(token);
      if (idx < 0) return -1;
      total += idx;
    }
    return total;
  };

  const render = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      filtered = items.slice();
    } else {
      const tokens = q.split(/\s+/);
      filtered = items
        .map((it) => [score(it, tokens), it])
        .filter(([s]) => s >= 0)
        .sort((a, b) => a[0] - b[0])
        .map(([, it]) => it);
    }

    listEl.textContent = '';
    emptyEl.hidden = filtered.length > 0;

    let lastGroup = null;
    filtered.forEach((it, i) => {
      if (it.group !== lastGroup) {
        const h = document.createElement('div');
        h.className = 'cmdk-group';
        h.textContent = it.group;
        listEl.appendChild(h);
        lastGroup = it.group;
      }
      listEl.appendChild(buildRow(it, i));
    });

    activeIndex = filtered.length ? 0 : -1;
    updateActive();
  };

  const buildRow = (it, i) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'cmdk-item';
    row.setAttribute('role', 'option');

    const iconWrap = document.createElement('span');
    iconWrap.className = 'cmdk-item-icon';
    iconWrap.innerHTML = `<i class="${it.icon}"></i>`;

    const textWrap = document.createElement('span');
    textWrap.className = 'cmdk-item-text';
    const titleEl = document.createElement('span');
    titleEl.className = 'cmdk-item-title';
    titleEl.textContent = it.title;
    textWrap.appendChild(titleEl);
    if (it.subtitle) {
      const subEl = document.createElement('span');
      subEl.className = 'cmdk-item-sub';
      subEl.textContent = it.subtitle;
      textWrap.appendChild(subEl);
    }

    row.appendChild(iconWrap);
    row.appendChild(textWrap);

    if (it.url) {
      const meta = document.createElement('span');
      meta.className = 'cmdk-item-meta';
      const isMail = it.url.startsWith('mailto:');
      const iconClass = isMail ? 'fa-envelope-open-text' : 'fa-arrow-up-right-from-square';
      meta.innerHTML = `<i class="fas ${iconClass}"></i>`;
      row.appendChild(meta);
    }

    row.addEventListener('click', () => activate(i));
    row.addEventListener('mousemove', () => {
      if (activeIndex !== i) { activeIndex = i; updateActive(); }
    });
    return row;
  };

  const updateActive = () => {
    const rows = listEl.querySelectorAll('.cmdk-item');
    rows.forEach((r, i) => r.classList.toggle('is-active', i === activeIndex));
    rows[activeIndex]?.scrollIntoView({ block: 'nearest' });
  };

  const activate = (i) => {
    if (i < 0 || i >= filtered.length) return;
    const it = filtered[i];
    close();
    if (it.scroll) {
      scrollToId(it.scroll);
    } else if (it.url) {
      if (it.url.startsWith('mailto:')) window.location.href = it.url;
      else if (it.url.startsWith('http')) window.open(it.url, '_blank', 'noopener,noreferrer');
      else window.location.href = it.url;
    }
  };

  let lastFocused = null;
  const open = () => {
    if (!modal.hidden) return;
    lastFocused = document.activeElement;
    input.value = '';
    modal.hidden = false;
    document.documentElement.classList.add('cmdk-open');
    render();
    requestAnimationFrame(() => input.focus());
  };
  const close = () => {
    if (modal.hidden) return;
    modal.hidden = true;
    document.documentElement.classList.remove('cmdk-open');
    lastFocused?.focus?.();
  };

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      modal.hidden ? open() : close();
      return;
    }
    if (e.key === '/' && modal.hidden) {
      const t = e.target;
      const editable = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if (!editable) { e.preventDefault(); open(); }
    }
  });

  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Enter')  { e.preventDefault(); activate(activeIndex); return; }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    if (!filtered.length) return;
    const dir = e.key === 'ArrowDown' ? 1 : -1;
    activeIndex = (activeIndex + dir + filtered.length) % filtered.length;
    updateActive();
  });

  input.addEventListener('input', render);
  modal.querySelectorAll('[data-cmdk-close]').forEach((el) => {
    el.addEventListener('click', close);
  });
  openBtn?.addEventListener('click', open);
})();

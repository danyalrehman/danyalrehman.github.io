# 🌐 danyalrehman.github.io

Personal website for [Danyal Rehman, Ph.D.](https://danyalrehman.com) — Banting Postdoctoral Researcher at Mila – Québec AI Institute. 🇨🇦

## 📖 Overview

A static site showcasing research publications, recent highlights, and contact information. Built with vanilla HTML, CSS, and JavaScript — no build step, no framework. Website format inspired by [Jon Barron](https://jonbarron.info/).

## ✨ Features

- Sticky nav with scroll progress, dark mode (the new theme spreads out from the toggle), and background-image toggles
- Command palette (⌘K / Ctrl-K / `/`) for quick section and paper navigation
- Long-form research blog pages with shared navigation, citation tools, and table-of-contents behavior
- Profile image generated on load, either autoregressively (patch by patch) or by diffusion from noise (`HERO_GENERATION` in `index.html`; preview with `?hero=diffusion`), with a tap-to-dissolve toggle
- Expandable paper abstracts with one-click BibTeX copy
- Animated count-up stats (citations, h-index, publications)
- Timeline-style recent highlights feed, with a tiny pixel icon per highlight (`data-kind`: paper, award, move, degree) and a "new" tag that expires on its own
- Faint pixel art framing the page: a Karachi skyline whose windows light up as you reach it, and corner clouds with a sun by day and a moon, stars and the occasional shooting star by night
- The name in Urdu (Nastaliq) on hover or tap
- Sections dissolve in pixel by pixel (an ordered dither) the first time they scroll into view
- Persisted preferences (dark mode, background) via `localStorage`
- Auto-updating footer timestamp

## 📂 Structure

```
index.html            — Main page
404.html              — Self-contained "page not found" page
stylesheet.css        — Site styles, theming, and dark mode
site.js               — Shared site chrome: theme/background toggles, sticky nav, back-to-top
cmdk.js               — Shared command palette (⌘K) and link-fade transition
last-updated.js       — Auto-updates the footer timestamp
blogs/                — Research blog posts and shared blog scripts/styles
blogs/blog-head.js    — Blog head setup: theme before paint, MathJax config
blogs/blog-body.js    — Blog-only interactions: citation copy, local-preview links
blogs/blog-shared.css — Shared blog styles
img/                  — Images and favicon
CNAME                 — Custom domain (danyalrehman.com)
```

## 🚀 Deployment

Hosted via [GitHub Pages](https://pages.github.com/). Pushing to `main` triggers deployment automatically.

## 📄 License

© 2026 Danyal Rehman. All rights reserved.

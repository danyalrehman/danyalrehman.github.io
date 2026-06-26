# 🌐 danyalrehman.github.io

Personal website for [Danyal Rehman, Ph.D.](https://danyalrehman.com) — Banting Postdoctoral Researcher at Mila – Québec AI Institute. 🇨🇦

## 📖 Overview

A static site showcasing research publications, recent highlights, and contact information. Built with vanilla HTML, CSS, and JavaScript — no build step, no framework. Website format inspired by [Jon Barron](https://jonbarron.info/).

## ✨ Features

- Sticky nav with scroll progress, dark mode, and background-image toggles
- Command palette (⌘K / Ctrl-K / `/`) for quick section and paper navigation
- Long-form research blog pages with shared navigation, citation tools, and table-of-contents behavior
- Tap-to-dissolve profile image with denoise-style animation
- Expandable paper abstracts with one-click BibTeX copy
- Animated count-up stats (citations, h-index, publications)
- Timeline-style recent highlights feed
- Persisted preferences (dark mode, background) via `localStorage`
- Auto-updating footer timestamp

## 📂 Structure

```
index.html          — Main page
stylesheet.css      — Homepage styles, theming, and dark mode
cmdk.js             — Shared command palette (⌘K) and link-fade transition
last-updated.js     — Auto-updates the footer timestamp
blogs/              — Research blog pages and shared blog scripts/styles
blogs/blog-head.js  — Shared blog head injection
blogs/blog-body.js  — Shared blog interactions
blogs/blog-shared.css — Shared blog styles
img/                — Images and favicon
CNAME               — Custom domain (danyalrehman.com)
```

## 🚀 Deployment

Hosted via [GitHub Pages](https://pages.github.com/). Pushing to `main` triggers deployment automatically.

## 📄 License

© 2026 Danyal Rehman. All rights reserved.

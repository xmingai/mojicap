# EmojiKit

The fastest emoji, symbols, and fancy text tool on the web.

## Features

- 🔥 **1,900+ Emojis** — Browse by category, search by name
- ★ **500+ Symbols** — Arrows, stars, math, currency, and more
- 𝓐 **20+ Fancy Text** — Unicode font transformations
- 🎭 **100+ Combos** — Curated emoji combinations & kaomoji
- ⚡ **Instant Copy** — Click to copy, paste anywhere
- 🌙 **Dark Mode** — System-aware theme switching
- 🔍 **Fuzzy Search** — Find any emoji in <50ms
- 📱 **Responsive** — Desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: shadcn/ui + Tailwind CSS v4
- **Search**: Fuse.js
- **Rendering**: SSG (1,900+ static pages)
- **Language**: TypeScript

## Getting Started

```bash
# Install dependencies
npm install

# Generate emoji data (run once)
node scripts/generate-emoji-data.mjs

# Start dev server
npm run dev

# Build for production
npm run build
```

## SEO

- 1,916 pre-rendered static pages
- Auto-generated sitemap.xml with all emoji detail pages
- Structured metadata for every page
- robots.txt configured for full crawling

## License

MIT

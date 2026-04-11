<div align="center">
  <a href="https://www.mojicap.com">
    <img width="150" src="https://raw.githubusercontent.com/xmingai/emojikit/main/public/icon.png" alt="MojiCap Logo">
  </a>

  <h1>⚡ MojiCap</h1>
  <p><strong>The fastest, SEO-optimized Emoji, Symbols & Kaomoji Tool Matrix</strong></p>
  
  <a href="https://www.mojicap.com" target="_blank">
    <img src="https://img.shields.io/badge/Live_Demo-mojicap.com-000000?style=for-the-badge&logo=vercel" alt="Live Demo" />
  </a>
</div>

<br />

## 🌟 Overview

[MojiCap](https://www.mojicap.com) is an open-source, ultra-fast web application built to be your ultimate hub for text, symbols, and emojis. Designed entirely with a "Search Engine Optimization (SEO) First" mindset, MojiCap employs Next.js App Router (SSR & SSG) out-of-the-box to ensure lightning-fast indexing and performance on search engines like Google and Bing.

If you are looking for an architectural benchmark on how to build a **Multi-lingual (i18n), high-traffic SEO tool matrix**, this repository holds the answer.

## ✨ Features

- **🚀 3,700+ Emojis**: Full Unicode 16.0 support, including skin tone modifiers. [Preview](https://www.mojicap.com/emoji)
- **★ 1,800+ Special Symbols**: From aesthetic shapes to math and currency, ready to copy. [Preview](https://www.mojicap.com/symbols)
- **ʕ•ᴥ•ʔ Kaomoji Hub**: Over 3,000 Japanese style text emoticons. [Preview](https://www.mojicap.com/kaomoji)
- **🎀 Aesthetic Combos**: Curated combinations of emojis for TikTok & Instagram bio. [Preview](https://www.mojicap.com/combos)
- **𝓕𝓪𝓷𝓬𝔂 𝓣𝓮𝔁𝓽**: Convert default latin character sets to gothic, cursive, and bold mathematical variants. [Preview](https://www.mojicap.com/fancy-text)
- **💯 Hardcore SEO Architecture**: 
  - Dynamic `JSON-LD` (FAQPage & Breadcrumbs) injected per-component.
  - Zero-JS required for initial crawl (Fully server-rendered).
  - Clean URL prefixing for 6 languages (`/en`, `/zh`, `/ja`, `/ko`, `/es`, `/ru`).

## 🛠 Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **SEO & Structure**: Next.js Metadata API, `next-sitemap`, IndexNow API integration.
- **Analytics**: `@next/third-parties/google` (GA4 integration without JS blocking)
- **Deployment**: [Vercel](https://vercel.com)

## 🏃‍♂️ Getting Started

1. Clone the repository
   ```bash
   git clone https://github.com/xmingai/emojikit.git
   cd emojikit
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Run the development server
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)

---

<br />

# 🇨🇳 中文说明 (Chinese)

[MojiCap](https://www.mojicap.com) 是一套完全基于开源代码构建的极限极速全能文本工具库。提供超过 **3700+ Emoji**、**1800+ 特殊符号**以及庞大的**颜文字(Kaomoji)**库的一键复制体验。

本项目的一个关键核心在于 **“SEO 统治级架构”**的实验与落地：

*   **真正的多语言路由矩阵**：摒弃有损爬虫的客户端重定向，使用了坚如磐石的路径前缀 (`/zh/`, `/ja/` 等) 来分配 6 大语种。
*   **富文本卡片利器**：全页面级别的自动化 `FAQPage` 和 `BreadcrumbList` 结构化数据 (JSON-LD) 注入，强行占领 Google 等搜索页的视口面积。
*   **SSR / SSG 渲染屏障**：由于使用了 Next.js App Router 渲染机制实现纯文本输出，它彻底杜绝了依靠 JS 渲染而导致的爬虫“空壳白屏”灾难。

对于需要参考出海搭建“**工具型 SEO 站群矩阵**”的开发者而言，这里的代码相当于一份开箱即用的白帽 SEO 最优解参考指南。

**👉 访问国内中文首页：[MojiCap 中文版](https://www.mojicap.com/zh)**

---

### License
GPL-3.0 License. All emoji imagery belongs to their respective operating systems and platform owners. This code infrastructure is open content.

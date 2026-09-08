# 站内推广位开发手册

顶部横条 · 右下角弹窗 · 页脚赞助链接。适用于「自家站点互推」场景（不是第三方广告）。本文是 MojiCap → Vormly AI 推广的抽象版，代码可直接复制到任何 Next.js App Router + Tailwind 项目；换框架时只需替换第 10 节的挂载方式和 `useDict` 取文案的方式。

---

## 0. 设计原则（先读这个）

这些原则是实际上线后被产品方逐条纠正出来的，比代码更值钱：

| 原则 | 具体含义 |
|---|---|
| **不打断主任务** | 弹窗只按时间触发（进站 5 秒），**不挂在任何用户动作上**。挂在「复制」之类的动作上等于在转化路径上多插一步。 |
| **一件事只说一次** | 品牌组合（A × B）在一个单元里只出现一次；优惠只写在按钮上；截止时间只由倒计时表达。任何重复都会被一眼看出来。 |
| **不抢站点的色** | 推广位用站点自己的中性色（`bg-muted` / `bg-foreground` 反色），不引入品牌蓝之类的强调色。 |
| **不标「广告」** | 自家站点互推按「官方推荐」处理，小字写 *Recommended by X*，链接用 `rel="noopener"`，不加 `sponsored` / `nofollow`。 |
| **永远可关闭、可记忆** | 关闭状态存本机，带到期时间戳。横条 12 小时后回来，弹窗 7 天，点了按钮 30 天。 |
| **不做全屏** | 弹窗桌面端是右下角 340px 卡片，手机端是贴底通栏，高度不超过屏幕 40%。Google 对移动端全屏插页有排名惩罚。 |
| **横条常驻** | 横条和导航栏放同一个 sticky 容器，滚动时一起钉在顶部。 |
| **倒计时必须是真的** | 所有访客倒数到同一个固定时刻，不做「刷新就重置」的假倒计时。到期自动隐藏。 |
| **一切可追踪、可 A/B、可一键下线** | 曝光/点击/关闭三个事件都带 `placement` 和 `variant`；`enabled: false` 全部下线。 |

---

## 1. 架构总览

```
src/
├─ lib/ads.ts                       ← 唯一的配置入口 + 纯函数（可单测）
├─ components/ads/
│  ├─ track.ts                      ← 事件上报（Vercel Analytics + GA4）
│  ├─ offer-countdown.tsx           ← 共用倒计时组件
│  ├─ vormly-banner.tsx             ← 顶部横条
│  └─ vormly-popup.tsx              ← 右下角弹窗
├─ components/footer.tsx            ← 页脚赞助链接（SponsoredBy）
├─ app/[locale]/layout.tsx          ← 挂载点
└─ i18n/dictionaries/*.json         ← 文案（ads.vormly.* / footer.sponsoredBy）
public/brand/                       ← 合作方 logo（深底用白色版）
tests/ads.test.ts                   ← 纯函数单测
```

数据流：

```
页面加载
  └─ Banner 挂载 → 读 localStorage(关闭记忆, A/B 分组) → 填充文案 → ad_impression
  └─ Popup 挂载  → 5s 计时器 → 检查 关闭记忆 + sessionStorage(本会话已弹) → 打开 → ad_impression
用户点击 CTA  → ad_click {placement, variant} → 新窗口打开带 UTM 的落地页
用户点击 ✕   → 写入到期时间戳 → ad_dismiss
```

三个单元共用同一份配置、同一套事件、同一个倒计时组件。

---

## 2. 配置中心 `src/lib/ads.ts`

所有「运营会改的东西」都在这里：活动截止时间、关闭记忆时长、弹窗延迟、排除页面、A/B 分组、存储键、UTM。**没有任何 React 依赖**，所以可以在 Node 里直接单测。

```ts
/**
 * Cross-promotion config for the partner site.
 * Everything an editor might want to change lives here; copy lives in the dictionaries.
 */
export type AdPlacement = "top_banner" | "corner_popup" | "footer_link";

export const VORMLY_AD = {
  enabled: true,
  /** Fixed campaign deadline. Every visitor counts down to the same instant. */
  offerEndsAt: "2026-09-22T23:59:59+08:00",
  /** How long a unit stays hidden after the visitor closes it (in days; 0.5 = 12 hours). */
  bannerDismissDays: 0.5,
  popupDismissDays: 7,
  /** Days to keep the popup hidden after the visitor clicks its CTA. */
  popupClickDays: 30,
  /** Popup appears this long after the page loads (time-based only; not tied to any user action). */
  popupDelayMs: 5000,
  /** Route prefixes (locale-free) where no promotion is shown. */
  excludedRoutes: ["/privacy", "/terms", "/about"],
  /** Copy variants in the A/B test. Each visitor is assigned one at random and keeps it. */
  variants: ["b", "c"] as const,
  storageKeys: {
    banner: "mojicap-ad-vormly-banner",
    popup: "mojicap-ad-vormly-popup",
    popupSession: "mojicap-ad-vormly-popup-session",
    variant: "mojicap-ad-vormly-variant",
  },
} as const;

export type AdVariant = (typeof VORMLY_AD.variants)[number];

/** Sticky 50/50 assignment so a visitor always sees the same copy and events stay comparable. */
export function getAssignedVariant(): AdVariant {
  const variants = VORMLY_AD.variants;
  try {
    const stored = localStorage.getItem(VORMLY_AD.storageKeys.variant);
    if (stored && (variants as readonly string[]).includes(stored)) return stored as AdVariant;
    const picked = variants[Math.floor(Math.random() * variants.length)];
    localStorage.setItem(VORMLY_AD.storageKeys.variant, picked);
    return picked;
  } catch {
    return variants[0];
  }
}

const UTM = {
  source: "mojicap",
  medium: "referral",
  campaign: "mojicap_partnership_2026q3",
} as const;

/** Landing URL with the standard UTM set; only utm_content varies per placement. */
export function vormlyUrl(placement: AdPlacement): string {
  const params = new URLSearchParams({
    utm_source: UTM.source,
    utm_medium: UTM.medium,
    utm_campaign: UTM.campaign,
    utm_content: placement,
  });
  return `https://vormly.ai/?${params.toString()}`;
}

export function offerEndsAtMs(): number {
  return new Date(VORMLY_AD.offerEndsAt).getTime();
}

/** True while the campaign window is open. */
export function isOfferActive(now: number = Date.now()): boolean {
  return now < offerEndsAtMs();
}

export function isExcludedRoute(localeFreePath: string): boolean {
  return VORMLY_AD.excludedRoutes.some((r) => localeFreePath === r || localeFreePath.startsWith(`${r}/`));
}

/** Expiry timestamp for a dismissal that should last `days`. */
export function dismissalExpiry(days: number, now: number = Date.now()): number {
  return now + days * 864e5;
}

/** Read a stored dismissal; returns true if it is still in force. */
export function isDismissed(key: string, now: number = Date.now()): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const until = Number(raw);
    return Number.isFinite(until) && until > now;
  } catch {
    return false;
  }
}

export function rememberDismissal(key: string, days: number) {
  try {
    localStorage.setItem(key, String(dismissalExpiry(days)));
  } catch {}
}

/** Split a remaining duration into d/h/m/s for the countdown. */
export function splitCountdown(msLeft: number) {
  const left = Math.max(0, msLeft);
  return {
    days: Math.floor(left / 864e5),
    hours: Math.floor((left % 864e5) / 3600e3),
    minutes: Math.floor((left % 3600e3) / 60e3),
    seconds: Math.floor((left % 60e3) / 1000),
  };
}
```

**为什么关闭记忆存「到期时间戳」而不是「关闭时间」：** 改时长时只改配置，不用迁移旧数据；读取只需一次比较。

---

## 3. 顶部横条

### 产品规则

| 项 | 规则 |
|---|---|
| 位置 | 页面最顶部，导航栏之上；与导航共用一个 `sticky top-0` 容器，滚动时一起固定 |
| 内容顺序 | 倒计时（桌面端） · **品牌前缀**：文案 · CTA 链接 · ✕ |
| 高度 | 最小 40px，一行 |
| 手机端 | 隐藏倒计时和长文案，只留品牌前缀 + CTA + ✕ |
| 关闭后 | 12 小时内不再出现，之后再次访问会回来（它是「常驻」的） |
| 到期后 | 倒计时自动隐藏，其余照常显示 |
| 排除页 | privacy / terms / about |

### 技术要点

- **SSR 先渲染一个空壳**（有背景色、无文字的 40px 带），客户端挂载后再填文字。这样绝大多数访客（没关过的）不会看到页面向下跳动；关过的人看到带子收起，可接受。
- 文案取决于 A/B 分组，而分组在 localStorage 里，服务端不可能知道 → 文案**必须**客户端填充，否则会 hydration 不匹配。
- `usePathname()` 用来判断排除页；如果站点有语言前缀路由，先去掉前缀再比。
- 倒计时组件自己 `setInterval`，横条不管时间。
- **中文标签必须 `whitespace-nowrap`**：中文可以逐字断行，flex 一压就会竖排成一列。

### 代码 `src/components/ads/vormly-banner.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useDict } from "@/i18n/context";
import { pathWithoutLocale } from "@/lib/seo";
import {
  VORMLY_AD, vormlyUrl, isExcludedRoute, isDismissed, rememberDismissal, getAssignedVariant, type AdVariant,
} from "@/lib/ads";
import { trackAd } from "./track";
import { OfferCountdown } from "./offer-countdown";

const PLACEMENT = "top_banner" as const;

export function VormlyBanner() {
  const dict = useDict();
  const pathname = usePathname();
  const excluded = isExcludedRoute(pathWithoutLocale(pathname));
  const [ready, setReady] = useState<{ visible: boolean; variant: AdVariant } | null>(null);

  useEffect(() => {
    if (!VORMLY_AD.enabled || excluded) return;
    const variant = getAssignedVariant();
    const visible = !isDismissed(VORMLY_AD.storageKeys.banner);
    // One-time read of localStorage after mount (unavailable during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady({ visible, variant });
    if (visible) trackAd("ad_impression", PLACEMENT, variant);
  }, [excluded]);

  if (!VORMLY_AD.enabled || excluded) return null;
  if (ready && !ready.visible) return null;

  const t = dict.ads.vormly;
  const copy = ready ? t[ready.variant] : null;

  const dismiss = () => {
    rememberDismissal(VORMLY_AD.storageKeys.banner, VORMLY_AD.bannerDismissDays);
    if (ready) trackAd("ad_dismiss", PLACEMENT, ready.variant);
    setReady({ visible: false, variant: ready?.variant ?? VORMLY_AD.variants[0] });
  };

  return (
    <div
      role="region"
      aria-label={t.eyebrow}
      className="relative flex min-h-10 items-center justify-center gap-3 border-b border-border/60 bg-muted px-11 py-2 text-[13.5px] text-foreground"
    >
      {copy && (
        <>
          <OfferCountdown className="hidden sm:inline-flex" />
          <span className="text-balance">
            <strong className="font-semibold">{t.eyebrow}</strong>
            <span className="hidden sm:inline">：{copy.banner}</span>
          </span>
          <a
            href={vormlyUrl(PLACEMENT)}
            target="_blank"
            rel="noopener"
            onClick={() => ready && trackAd("ad_click", PLACEMENT, ready.variant)}
            className="whitespace-nowrap font-semibold underline decoration-foreground/40 underline-offset-[3px] hover:decoration-foreground"
          >
            {t.ctaBanner}
          </a>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t.close}
            className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md opacity-70 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}
```

---

## 4. 右下角弹窗

### 产品规则

| 项 | 规则 |
|---|---|
| 触发 | 进站 **5 秒**，纯计时器；不监听复制/滚动/点击等任何动作 |
| 频次 | 每个会话最多 1 次（sessionStorage） |
| 关闭后 | 7 天不再出现；点击 CTA 则 30 天 |
| 关闭方式 | ✕ 按钮、Esc 键 |
| 桌面端 | 右下角，340px 宽，圆角卡片 |
| 手机端 | 贴底通栏（左右各 12px），高度约屏幕 1/3，**绝不全屏** |
| 结构（自上而下） | 头图（深灰底，**A logo × B logo**，✕ 在右上）→ 标题 → 一句话正文 → 能力标签 → **倒计时** → CTA 按钮（承载优惠）→ 小字（*Recommended by A*） |
| 不重复 | 品牌组合只在头图出现一次；优惠只在按钮；截止只在倒计时；小字不写日期 |
| 配色 | 头图 `bg-zinc-900`，按钮 `bg-foreground text-background`，其余用站点 muted 色；无强调色 |

### 技术要点

- 弹窗在打开前渲染 `null`，不参与 SSR，不会有 hydration 问题。
- `sessionStorage` 做会话上限；`localStorage` 做跨会话记忆。两个 key 分开。
- **测试时的坑**：会话上限是在挂载时读取的。如果你在页面已加载后才清 sessionStorage，本次不会弹——要先清再刷新。
- logo 用 `next/image`，深色头图用合作方的白色版 logotype；两个 logo 放左上，✕ 放右上，永不重叠。
- 头图高度 80px，logo 垂直居中；不要在头图下再放一行品牌文字。

### 代码 `src/components/ads/vormly-popup.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";
import { useDict } from "@/i18n/context";
import { pathWithoutLocale } from "@/lib/seo";
import {
  VORMLY_AD, vormlyUrl, isExcludedRoute, isDismissed, rememberDismissal, getAssignedVariant, type AdVariant,
} from "@/lib/ads";
import { trackAd } from "./track";
import { OfferCountdown } from "./offer-countdown";

const PLACEMENT = "corner_popup" as const;
const MODELS = ["Seedance", "Veo", "Kling", "Grok Video", "Midjourney", "Suno"]; // 能力标签，按合作方改

export function VormlyPopup() {
  const dict = useDict();
  const pathname = usePathname();
  const excluded = isExcludedRoute(pathWithoutLocale(pathname));
  const [open, setOpen] = useState<{ variant: AdVariant } | null>(null);

  useEffect(() => {
    if (!VORMLY_AD.enabled || excluded) return;
    if (isDismissed(VORMLY_AD.storageKeys.popup)) return;
    try {
      if (sessionStorage.getItem(VORMLY_AD.storageKeys.popupSession)) return;
    } catch {}

    const timer = setTimeout(() => {
      const variant = getAssignedVariant();
      try {
        sessionStorage.setItem(VORMLY_AD.storageKeys.popupSession, "1");
      } catch {}
      setOpen({ variant });
      trackAd("ad_impression", PLACEMENT, variant);
    }, VORMLY_AD.popupDelayMs);
    return () => clearTimeout(timer);
  }, [excluded]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const t = dict.ads.vormly;
  const copy = t[open.variant];

  function dismiss() {
    rememberDismissal(VORMLY_AD.storageKeys.popup, VORMLY_AD.popupDismissDays);
    if (open) trackAd("ad_dismiss", PLACEMENT, open.variant);
    setOpen(null);
  }

  function clickCta() {
    rememberDismissal(VORMLY_AD.storageKeys.popup, VORMLY_AD.popupClickDays);
    if (open) trackAd("ad_click", PLACEMENT, open.variant);
  }

  return (
    <div
      role="dialog"
      aria-labelledby="vormly-popup-title"
      className="fixed bottom-3 left-3 right-3 z-50 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 sm:bottom-4 sm:left-auto sm:right-4 sm:w-[340px]"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label={t.close}
        className="absolute right-2.5 top-2.5 z-10 grid h-7 w-7 place-items-center rounded-full bg-black/30 text-white transition hover:bg-black/50"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="relative flex h-20 items-center bg-zinc-900 px-4 text-white dark:bg-zinc-800">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="MojiCap" width={22} height={22} className="rounded-md" />
          <span className="text-[13px] font-bold opacity-80">×</span>
          <Image src="/brand/vormly-logotype-white.svg" alt="Vormly AI" width={86} height={20} className="h-5 w-auto" />
        </div>
      </div>
      <div className="grid gap-2.5 p-4">
        <h3 id="vormly-popup-title" className="text-balance text-lg font-bold leading-tight">
          {copy.title}
        </h3>
        <p className="text-[13.5px] text-muted-foreground">{copy.body}</p>
        <div className="flex flex-wrap gap-1.5">
          {MODELS.map((m) => (
            <span key={m} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              {m}
            </span>
          ))}
        </div>
        <div className="flex justify-center rounded-lg bg-muted px-3 py-2 text-[13px]">
          <OfferCountdown />
        </div>
        <a
          href={vormlyUrl(PLACEMENT)}
          target="_blank"
          rel="noopener"
          onClick={clickCta}
          className="mt-0.5 block rounded-xl bg-foreground px-4 py-2.5 text-center font-semibold text-background transition hover:bg-foreground/90"
        >
          {t.ctaPopup}
        </a>
        <div className="text-center text-[11px] text-muted-foreground">{t.fine}</div>
      </div>
    </div>
  );
}
```

---

## 5. 倒计时组件 `src/components/ads/offer-countdown.tsx`

横条和弹窗共用。固定截止时刻、`d hh:mm:ss`、每秒刷新、到期返回 `null`。初始 `now` 用惰性 `useState(() => Date.now())`，避免在 effect 里同步 `setState`（会被 React 编译器 lint 拦）。

```tsx
"use client";

import { useEffect, useState } from "react";
import { useDict } from "@/i18n/context";
import { isOfferActive, offerEndsAtMs, splitCountdown } from "@/lib/ads";

export function OfferCountdown({ className = "" }: { className?: string }) {
  const dict = useDict();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isOfferActive()) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!isOfferActive(now)) return null;

  const t = dict.ads.vormly;
  const { days, hours, minutes, seconds } = splitCountdown(offerEndsAtMs() - now);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap font-semibold tabular-nums ${className}`}
      aria-live="off"
    >
      <span className="mr-1 whitespace-nowrap">
        {t.endsIn} {days}
        {t.day}
      </span>
      {[hours, minutes, seconds].map((n, i) => (
        <span key={i} className="inline-flex gap-0.5">
          {i > 0 && <b className="opacity-60">:</b>}
          <span className="min-w-5 rounded bg-foreground px-1 text-center text-background">{pad(n)}</span>
        </span>
      ))}
    </span>
  );
}
```

---

## 6. 页脚赞助链接

### 产品规则

| 项 | 规则 |
|---|---|
| 位置 | 页脚最底一行，三栏：版权 · **❤️ 赞助 by Brand** · Privacy / Terms |
| 链接属性 | **Dofollow**：只有 `rel="noopener"`，不加 `nofollow` / `sponsored` |
| URL | **裸 URL**（`https://partner.tld/`），**不带 UTM**——外链权重信号保持干净 |
| 锚文本 | 品牌名本身（对 SEO 最有价值） |
| 追踪 | 点击仍打 `ad_click {placement: "footer_link"}`，不影响统计 |
| 文案 | 字典 `footer.sponsoredBy`，用 `{brand}` 槽位标记锚文本位置，各语言自行排序（日文「{brand} の提供」品牌在前） |

### SEO 注意

页脚外链是**全站每页**都出现的 dofollow 链接。两个自家站点之间做一条没问题；如果往页脚堆第二、第三个外部站点的 dofollow，开始像链接农场，Google 会打折扣。**一条就够。**

### 代码（放在 `footer.tsx` 底部）

```tsx
import { trackAd } from "@/components/ads/track";

// 页脚底行：
// <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
//   <p>{copyright}</p>
//   <SponsoredBy text={t.sponsoredBy} />
//   <div className="flex gap-4">{privacy}{terms}</div>
// </div>

/**
 * "❤️ Sponsored by Brand" — a deliberate dofollow link to the sister site.
 * Plain URL (no UTM) so the link-equity signal is clean; clicks are still
 * counted via the ad_click event. `{brand}` in the dictionary string marks
 * where the anchor text goes.
 */
function SponsoredBy({ text }: { text: string }) {
  const [before, after] = text.split("{brand}");
  return (
    <p className="flex items-center gap-1">
      <span aria-hidden="true">❤️</span>
      <span>
        {before}
        <a
          href="https://vormly.ai/"
          target="_blank"
          rel="noopener"
          onClick={() => trackAd("ad_click", "footer_link")}
          className="font-medium text-foreground hover:underline underline-offset-[3px]"
        >
          Vormly
        </a>
        {after}
      </span>
    </p>
  );
}
```

---

## 7. 追踪、A/B、UTM

### 事件 `src/components/ads/track.ts`

同一个事件同时发到 Vercel Analytics 和 GA4（若存在）。

```ts
"use client";

import { track } from "@vercel/analytics";
import type { AdPlacement, AdVariant } from "@/lib/ads";

type AdEvent = "ad_impression" | "ad_click" | "ad_dismiss";

/** Send an ad event to both Vercel Analytics and GA4 (when loaded). */
export function trackAd(name: AdEvent, placement: AdPlacement, variant?: AdVariant) {
  const data = variant ? { placement, variant } : { placement };
  track(name, data);
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, { event_category: "promo", event_label: variant ? `${placement}:${variant}` : placement, ...data });
  }
}
```

| 事件 | 何时 | 参数 |
|---|---|---|
| `ad_impression` | 横条填充可见时；弹窗打开时 | `placement`, `variant` |
| `ad_click` | 点 CTA / 页脚链接 | `placement`, `variant`（页脚无 variant） |
| `ad_dismiss` | 点 ✕ 或 Esc | `placement`, `variant` |

**算 CTR**：按 `placement × variant` 分组，`ad_click / ad_impression`。两周后比 B、C 两组，留下高的那个（把 `variants` 改成单元素数组即可，无需改组件）。

### A/B 分组

- 首次访问随机 50/50，存 `localStorage[variant]`，之后固定。
- 横条和弹窗读同一个分组，保证同一访客看到的是同一套叙事。
- 变体只影响文案（字典里的 `b` / `c` 对象），不影响布局，所以 A/B 结论只反映文案差异。

### UTM 规范

| 参数 | 值 | 说明 |
|---|---|---|
| `utm_source` | `mojicap` | 流量来自哪个站 |
| `utm_medium` | `referral` | 自家站互推的标准写法，不用 display / cpc |
| `utm_campaign` | `mojicap_partnership_2026q3` | 带季度，换活动改这里 |
| `utm_content` | `top_banner` / `corner_popup` | 区分位置，**唯一随位置变化的参数** |

规则：全小写、下划线、无空格无中文。页脚链接**不带 UTM**（见第 6 节）。

---

## 8. 文案与 i18n

字典命名空间 `ads.<partner>`。所有语言必须 key 对齐（用脚本校验 parity）。

```json
{
  "ads": {
    "vormly": {
      "eyebrow": "MojiCap × Vormly AI",
      "endsIn": "Ends in",
      "day": "d",
      "ctaBanner": "Claim →",
      "ctaPopup": "Claim 3-day trial + 200 credits",
      "fine": "Recommended by MojiCap",
      "close": "Close",
      "b": {
        "banner": "Seedance, Veo, Kling and Grok Video in one place. Sign up for a 3-day trial + 200 credits.",
        "title": "Every major AI video model, one workspace",
        "body": "MojiCap × Vormly AI brings Seedance, Veo, Kling, Grok Video and Midjourney together."
      },
      "c": {
        "banner": "3-day trial + 200 free credits for MojiCap users.",
        "title": "A perk for MojiCap users",
        "body": "The AI creation suite we recommend to MojiCap users: images, video and music in one place."
      }
    }
  },
  "footer": { "sponsoredBy": "Sponsored by {brand}" }
}
```

约定：

- `eyebrow` 是品牌组合，横条里加粗出现一次；弹窗**不**再显示它（头图 logo 已表达）。
- 变体的 `banner` 不含品牌前缀（组件会拼 `eyebrow：banner`）。
- 变体的 `title` 不能等于 `eyebrow`（否则弹窗里品牌出现两次）。
- `fine` 不含日期（截止由倒计时表达）。
- `{brand}` 槽位只用于页脚。
- 推广文案跟随页面语言，不做「只英文」。

---

## 9. 存储键与生命周期

| Key（localStorage 除非注明） | 值 | 生命周期 |
|---|---|---|
| `<site>-ad-<partner>-banner` | 到期时间戳 ms | 关闭后 12h |
| `<site>-ad-<partner>-popup` | 到期时间戳 ms | 关闭后 7d；点 CTA 后 30d |
| `<site>-ad-<partner>-popup-session`（sessionStorage） | `"1"` | 本会话 |
| `<site>-ad-<partner>-variant` | `"b"` / `"c"` | 永久（换活动时可改 key 名重新分组） |

所有读写都包 `try/catch`：隐私模式、禁用存储、SSR 都不会抛错。

---

## 10. 挂载

```tsx
// app/[locale]/layout.tsx
import { VormlyBanner } from "@/components/ads/vormly-banner";
import { VormlyPopup } from "@/components/ads/vormly-popup";

<body>
  <Providers>
    {/* 横条和导航共用一个 sticky 容器；Navbar 自身不再 sticky */}
    <div className="sticky top-0 z-50">
      <VormlyBanner />
      <Navbar />
    </div>
    <main className="flex-1">{children}</main>
    <Footer />
    <Toaster />
    <VormlyPopup />
  </Providers>
</body>
```

如果站点里有 `sticky top-24` 之类相对导航栏偏移的元素，加了 40px 横条后要复核偏移值。

---

## 11. 移植到新项目（约 15 分钟）

1. 复制 `src/lib/ads.ts`、`src/components/ads/*`、`tests/ads.test.ts`。
2. 全局替换：`VORMLY_AD` → `PARTNER_AD`，`vormlyUrl` → `partnerUrl`，`Vormly*` 组件名，`storageKeys` 前缀 `mojicap-ad-vormly` → `<site>-ad-<partner>`。
3. 改配置：`offerEndsAt`、`excludedRoutes`、`UTM.source/campaign`、落地页域名。
4. 放合作方 logo 到 `public/brand/`（深色头图用白色版），改弹窗 `Image` 的 src/alt/尺寸（按高度 20px 等比）。
5. 改 `MODELS` 能力标签（或删掉这一行）。
6. 字典：新增 `ads.<partner>` 和 `footer.sponsoredBy`，所有语言对齐。
7. 挂载（第 10 节），把原 Navbar 的 `sticky top-0 z-50` 去掉。
8. 页脚加 `SponsoredBy`，改 href 和锚文本。
9. 若无 Vercel Analytics，把 `track.ts` 里的 `track()` 换成你的上报函数，或删掉只留 gtag。
10. 若无 `pathWithoutLocale`（无语言前缀的站），直接把 `usePathname()` 传给 `isExcludedRoute`。
11. 跑 `tsc`、lint、`npm test`、build。
12. 按第 12 节清单在**生产构建**（`next start`）+ 浏览器里验收，不要只看 dev。

---

## 12. 验收清单（都是踩过的坑）

- [ ] 弹窗**不点任何东西**、等 5 秒自己出现
- [ ] 弹窗里：品牌组合只出现 1 次；「200」只出现 1 次（按钮）；日期文字 0 次（只有倒计时）
- [ ] 头图 logo 和 ✕ 不重叠（取两者 `getBoundingClientRect` 检查）
- [ ] 横条滚动 1000px 后 `top === 0`，导航栏紧贴其下
- [ ] 中文「还剩 14 天」不竖排（`whitespace-nowrap`）
- [ ] 弹窗倒计时和横条倒计时同一时刻同一数字
- [ ] 关闭横条 → 刷新仍隐藏 → localStorage 到期戳 ≈ now + 12h
- [ ] 关闭弹窗 → 刷新仍隐藏 → 到期戳 ≈ now + 7d
- [ ] 先清 sessionStorage **再刷新**，弹窗才会再弹（挂载时读取）
- [ ] 排除页（privacy 等）两个单元都不出现
- [ ] 手机宽度：弹窗贴底通栏、不全屏；横条只剩品牌 + CTA
- [ ] 两个 UTM 链接分别是 `top_banner` / `corner_popup`；页脚链接无 UTM、无 nofollow
- [ ] 切换语言，三处文案都跟着变
- [ ] 无强调色：横条/按钮/头图都是站点中性色
- [ ] 原型（如有）里 `.banner` 不要在 `position: sticky` 后面再写 `position: relative`——会把 sticky 覆盖掉

---

## 13. 到期与下线

- **到期日到了**：倒计时自动消失，横条和弹窗继续展示。此时要么延期（改 `offerEndsAt`），要么下线。
- **下线**：`enabled: false`，两个单元立即不渲染；页脚链接独立，需要的话单独删。
- **换一轮活动**：改 `offerEndsAt`、`UTM.campaign`，并把 `storageKeys.variant` 改个名（重新分组），关闭记忆 key 也可一起改（让关过的人重新看到）。

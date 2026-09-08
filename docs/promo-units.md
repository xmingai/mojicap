# 站内推广位开发手册

顶部横条 · 右下角弹窗 · 页脚赞助链接。**推广目标固定为 Vormly AI**，接入它的站点是变量：每个新站点只需填第 2 节「站点变量」那几项，Vormly 相关的名称、链接、logo、优惠文案全部沿用。代码可直接复制到任何 Next.js App Router + Tailwind 项目。换框架时只需替换第 10 节的挂载方式和 `useDict` 取文案的方式。

---

## 0. 设计原则（先读这个）

这些原则是实际上线后被产品方逐条纠正出来的，比代码更值钱：

| 原则 | 具体含义 |
|---|---|
| **不打断主任务** | 弹窗只按时间触发（进站 5 秒），**不挂在任何用户动作上**。挂在核心动作（复制、下载、提交）上等于在转化路径上多插一步。 |
| **一件事只说一次** | 品牌组合（Site × Partner）在一个单元里只出现一次；优惠只写在按钮上；截止时间只由倒计时表达。任何重复都会被一眼看出来。 |
| **不抢站点的色** | 推广位用站点自己的中性色（`bg-muted` / `bg-foreground` 反色），不引入合作方品牌色之类的强调色。 |
| **不标「广告」** | 自家站点互推按「官方推荐」处理，小字写 *Recommended by Site*，链接用 `rel="noopener"`，不加 `sponsored` / `nofollow`。 |
| **永远可关闭、可记忆** | 关闭状态存本机，带到期时间戳。横条 12 小时后回来；弹窗关闭 24 小时后回来，点了按钮也是 24 小时。 |
| **不做全屏** | 弹窗桌面端是右下角 340px 卡片，手机端是贴底通栏，高度不超过屏幕 40%。Google 对移动端全屏插页有排名惩罚。 |
| **横条常驻** | 横条和导航栏放同一个 sticky 容器，滚动时一起钉在顶部。 |
| **倒计时必须是真的** | 所有访客倒数到同一个固定时刻，不做「刷新就重置」的假倒计时。到期自动隐藏。 |
| **一切可追踪、可 A/B、可一键下线** | 曝光/点击/关闭三个事件都带 `placement` 和 `variant`；`enabled: false` 全部下线。 |

---

## 1. 架构总览

```
src/
├─ lib/promo.ts                     ← 唯一的配置入口 + 纯函数（可单测）
├─ components/promo/
│  ├─ track.ts                      ← 事件上报（Vercel Analytics + GA4）
│  ├─ offer-countdown.tsx           ← 共用倒计时组件
│  ├─ promo-banner.tsx              ← 顶部横条
│  └─ promo-popup.tsx               ← 右下角弹窗
├─ components/footer.tsx            ← 页脚赞助链接（SponsoredBy）
├─ app/[locale]/layout.tsx          ← 挂载点
└─ i18n/dictionaries/*.json         ← 文案（promo.* / footer.sponsoredBy）
public/brand/                       ← 合作方 logo（深底用白色版）
tests/promo.test.ts                 ← 纯函数单测
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

## 2. 填值表：接入新项目只改「站点变量」

### 固定值（Vormly，所有站点相同，不要改）

| 字段 | 值 |
|---|---|
| `partner.name` | `Vormly` |
| `partner.url` | `https://vormly.ai/`（裸 URL，末尾带 `/`） |
| `partner.logoOnDark` | `/brand/vormly-logotype-white.svg`（白色版 logotype，从 `https://vormly.ai/brand/logotype-white.svg` 下载放到本站 `public/brand/`） |
| `partner.logoSize` | `{ width: 86, height: 20 }`（916×213 的原图按高 20px 等比） |
| `highlights` | `["Seedance","Veo","Kling","Grok Video","Midjourney","Suno"]` |
| 优惠文案 | 3 天免费试用 + 200 积分（只出现在弹窗按钮和横条文案里） |
| `utm.medium` | `referral` |
| 字典 `promo.*` 里 Vormly 侧的措辞 | 见第 9 节，直接复制 |

### 站点变量（每个项目填这些）

| 字段 | 含义 | 示例（MojiCap） |
|---|---|---|
| `site.name` | 本站名称，用于「Recommended by」、品牌前缀、logo alt | `MojiCap` |
| `site.logo` | 本站 logo 路径（弹窗头图左侧） | `/logo.png` |
| `storagePrefix` | 本机存储键前缀，`<site>-promo-vormly` | `mojicap-promo-vormly` |
| `utm.source` | 本站短名，全小写 | `mojicap` |
| `utm.campaign` | `<site>_partnership_<yyyyqN>` | `mojicap_partnership_2026q3` |
| `excludedRoutes` | 本站不展示推广的路径前缀 | `["/privacy","/terms","/about"]` |
| 字典 `promo.*` 里的 `{site}` | 替换成本站名称 | — |
| 字典 `footer.sponsoredBy` | 页脚前缀，`{brand}` 槽位 | `Sponsored by {brand}` |

### 活动参数（每轮活动统一改，所有站点保持一致）

| 字段 | 含义 | 当前值 |
|---|---|---|
| `offerEndsAt` | 固定截止时刻，ISO 带时区 | `2026-09-22T23:59:59+08:00` |
| `bannerDismissDays` | 横条关闭后多久回来 | `0.5`（12 小时） |
| `popupDismissDays` | 弹窗关闭后多久回来 | `1`（24 小时） |
| `popupClickDays` | 弹窗点击按钮后多久回来 | `1`（24 小时） |
| `popupDelayMs` | 弹窗延迟 | `5000` |
| `variants` | A/B 文案分组，对应字典里的对象名 | `["b","c"]` |

---

## 3. 配置中心 `src/lib/promo.ts`

**没有任何 React 依赖**，可以在 Node 里直接单测。

```ts
/**
 * Cross-promotion config for a partner (sister) site.
 * Everything an editor might change lives here; copy lives in the dictionaries under `promo`.
 */
export type AdPlacement = "top_banner" | "corner_popup" | "footer_link";

export const PROMO = {
  enabled: true,

  /** Per-site variables — the only block a new project must fill in. */
  site: {
    name: "MojiCap",
    logo: "/logo.png",
  },
  /** Fixed: Vormly is always the promotion target. Do not change per site. */
  partner: {
    name: "Vormly",
    /** Plain landing URL; UTM is added by partnerUrl(). The footer link uses this URL as-is. */
    url: "https://vormly.ai/",
    /** White logotype for the dark popup hero. Size it by height (20px). */
    logoOnDark: "/brand/vormly-logotype-white.svg",
    logoSize: { width: 86, height: 20 },
  },
  /** Fixed: Vormly capability tags shown in the popup. */
  highlights: ["Seedance", "Veo", "Kling", "Grok Video", "Midjourney", "Suno"],

  /** Fixed campaign deadline. Every visitor counts down to the same instant. */
  offerEndsAt: "2026-09-22T23:59:59+08:00",
  /** How long a unit stays hidden after the visitor closes it (days; 0.5 = 12 hours). */
  bannerDismissDays: 0.5,
  popupDismissDays: 1,
  /** Days to keep the popup hidden after the visitor clicks its CTA (also 24h). */
  popupClickDays: 1,
  /** Popup appears this long after the page loads (time-based only; never tied to a user action). */
  popupDelayMs: 5000,
  /** Route prefixes (locale-free) where no promotion is shown. */
  excludedRoutes: ["/privacy", "/terms", "/about"],
  /** Copy variants in the A/B test; each visitor is assigned one at random and keeps it. */
  variants: ["b", "c"] as const,

  /** Per-site: <site>-promo-vormly */
  storagePrefix: "mojicap-promo-vormly",
  utm: {
    source: "mojicap", // per-site
    medium: "referral", // fixed
    campaign: "mojicap_partnership_2026q3", // per-site, per-quarter
  },
} as const;

export type AdVariant = (typeof PROMO.variants)[number];

export const STORAGE = {
  banner: `${PROMO.storagePrefix}-banner`,
  popup: `${PROMO.storagePrefix}-popup`,
  popupSession: `${PROMO.storagePrefix}-popup-session`,
  variant: `${PROMO.storagePrefix}-variant`,
} as const;

/** Sticky 50/50 assignment so a visitor always sees the same copy and events stay comparable. */
export function getAssignedVariant(): AdVariant {
  const variants = PROMO.variants;
  try {
    const stored = localStorage.getItem(STORAGE.variant);
    if (stored && (variants as readonly string[]).includes(stored)) return stored as AdVariant;
    const picked = variants[Math.floor(Math.random() * variants.length)];
    localStorage.setItem(STORAGE.variant, picked);
    return picked;
  } catch {
    return variants[0];
  }
}

/** Landing URL with the standard UTM set; only utm_content varies per placement. */
export function partnerUrl(placement: AdPlacement): string {
  const params = new URLSearchParams({
    utm_source: PROMO.utm.source,
    utm_medium: PROMO.utm.medium,
    utm_campaign: PROMO.utm.campaign,
    utm_content: placement,
  });
  return `${PROMO.partner.url}?${params.toString()}`;
}

export function offerEndsAtMs(): number {
  return new Date(PROMO.offerEndsAt).getTime();
}

/** True while the campaign window is open. */
export function isOfferActive(now: number = Date.now()): boolean {
  return now < offerEndsAtMs();
}

export function isExcludedRoute(localeFreePath: string): boolean {
  return PROMO.excludedRoutes.some((r) => localeFreePath === r || localeFreePath.startsWith(`${r}/`));
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

## 4. 顶部横条

### 产品规则

| 项 | 规则 |
|---|---|
| 位置 | 页面最顶部，导航栏之上；与导航共用一个 `sticky top-0` 容器，滚动时一起固定 |
| 内容顺序 | 倒计时（桌面端） · **品牌前缀**：文案 · CTA 链接 · ✕ |
| 高度 | 最小 40px，一行 |
| 手机端 | 隐藏倒计时和长文案，只留品牌前缀 + CTA + ✕ |
| 关闭后 | 12 小时内不再出现，之后再次访问会回来（它是「常驻」的） |
| 到期后 | 倒计时自动隐藏，其余照常显示 |
| 排除页 | `excludedRoutes` |

### 技术要点

- **SSR 先渲染一个空壳**（有背景色、无文字的 40px 带），客户端挂载后再填文字。这样绝大多数访客（没关过的）不会看到页面向下跳动；关过的人看到带子收起，可接受。
- 文案取决于 A/B 分组，而分组在 localStorage 里，服务端不可能知道 → 文案**必须**客户端填充，否则会 hydration 不匹配。
- `usePathname()` 用来判断排除页；如果站点有语言前缀路由，先去掉前缀再比。
- 倒计时组件自己 `setInterval`，横条不管时间。
- **中文标签必须 `whitespace-nowrap`**：中文可以逐字断行，flex 一压就会竖排成一列。

### 代码 `src/components/promo/promo-banner.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useDict } from "@/i18n/context";
import { pathWithoutLocale } from "@/lib/seo"; // 无语言前缀的站：直接用 pathname
import {
  PROMO, STORAGE, partnerUrl, isExcludedRoute, isDismissed, rememberDismissal, getAssignedVariant, type AdVariant,
} from "@/lib/promo";
import { trackAd } from "./track";
import { OfferCountdown } from "./offer-countdown";

const PLACEMENT = "top_banner" as const;

export function PromoBanner() {
  const dict = useDict();
  const pathname = usePathname();
  const excluded = isExcludedRoute(pathWithoutLocale(pathname));
  const [ready, setReady] = useState<{ visible: boolean; variant: AdVariant } | null>(null);

  useEffect(() => {
    if (!PROMO.enabled || excluded) return;
    const variant = getAssignedVariant();
    const visible = !isDismissed(STORAGE.banner);
    // One-time read of localStorage after mount (unavailable during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady({ visible, variant });
    if (visible) trackAd("ad_impression", PLACEMENT, variant);
  }, [excluded]);

  if (!PROMO.enabled || excluded) return null;
  if (ready && !ready.visible) return null;

  const t = dict.promo;
  const copy = ready ? t[ready.variant] : null;

  const dismiss = () => {
    rememberDismissal(STORAGE.banner, PROMO.bannerDismissDays);
    if (ready) trackAd("ad_dismiss", PLACEMENT, ready.variant);
    setReady({ visible: false, variant: ready?.variant ?? PROMO.variants[0] });
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
            href={partnerUrl(PLACEMENT)}
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

## 5. 右下角弹窗

### 产品规则

| 项 | 规则 |
|---|---|
| 触发 | 进站 **5 秒**，纯计时器；不监听任何用户动作 |
| 频次 | 每个会话最多 1 次（sessionStorage） |
| 关闭后 | 24 小时不再出现；点击 CTA 也是 24 小时 |
| 关闭方式 | ✕ 按钮、Esc 键 |
| 桌面端 | 右下角，340px 宽，圆角卡片 |
| 手机端 | 贴底通栏（左右各 12px），高度约屏幕 1/3，**绝不全屏** |
| 结构（自上而下） | 头图（深灰底，**本站 logo × Vormly logo**，✕ 在右上）→ 标题 → 一句话正文 → Vormly 能力标签 → **倒计时** → CTA 按钮（承载优惠）→ 小字（*Recommended by 本站*） |
| 不重复 | 品牌组合只在头图出现一次；优惠只在按钮；截止只在倒计时；小字不写日期 |
| 配色 | 头图 `bg-zinc-900`，按钮 `bg-foreground text-background`，其余用站点 muted 色；无强调色 |

### 技术要点

- 弹窗在打开前渲染 `null`，不参与 SSR，不会有 hydration 问题。
- `sessionStorage` 做会话上限；`localStorage` 做跨会话记忆。两个 key 分开。
- **测试时的坑**：会话上限是在挂载时读取的。如果你在页面已加载后才清 sessionStorage，本次不会弹——要先清再刷新。
- logo 用 `next/image`，深色头图用合作方的白色版 logotype；两个 logo 放左上，✕ 放右上，永不重叠。
- 头图高度 80px，logo 垂直居中；不要在头图下再放一行品牌文字。

### 代码 `src/components/promo/promo-popup.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";
import { useDict } from "@/i18n/context";
import { pathWithoutLocale } from "@/lib/seo";
import {
  PROMO, STORAGE, partnerUrl, isExcludedRoute, isDismissed, rememberDismissal, getAssignedVariant, type AdVariant,
} from "@/lib/promo";
import { trackAd } from "./track";
import { OfferCountdown } from "./offer-countdown";

const PLACEMENT = "corner_popup" as const;

export function PromoPopup() {
  const dict = useDict();
  const pathname = usePathname();
  const excluded = isExcludedRoute(pathWithoutLocale(pathname));
  const [open, setOpen] = useState<{ variant: AdVariant } | null>(null);

  useEffect(() => {
    if (!PROMO.enabled || excluded) return;
    if (isDismissed(STORAGE.popup)) return;
    try {
      if (sessionStorage.getItem(STORAGE.popupSession)) return;
    } catch {}

    const timer = setTimeout(() => {
      const variant = getAssignedVariant();
      try {
        sessionStorage.setItem(STORAGE.popupSession, "1");
      } catch {}
      setOpen({ variant });
      trackAd("ad_impression", PLACEMENT, variant);
    }, PROMO.popupDelayMs);
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

  const t = dict.promo;
  const copy = t[open.variant];

  function dismiss() {
    rememberDismissal(STORAGE.popup, PROMO.popupDismissDays);
    if (open) trackAd("ad_dismiss", PLACEMENT, open.variant);
    setOpen(null);
  }

  function clickCta() {
    rememberDismissal(STORAGE.popup, PROMO.popupClickDays);
    if (open) trackAd("ad_click", PLACEMENT, open.variant);
  }

  return (
    <div
      role="dialog"
      aria-labelledby="promo-popup-title"
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
          <Image src={PROMO.site.logo} alt={PROMO.site.name} width={22} height={22} className="rounded-md" />
          <span className="text-[13px] font-bold opacity-80">×</span>
          <Image
            src={PROMO.partner.logoOnDark}
            alt={PROMO.partner.name}
            width={PROMO.partner.logoSize.width}
            height={PROMO.partner.logoSize.height}
            className="h-5 w-auto"
          />
        </div>
      </div>
      <div className="grid gap-2.5 p-4">
        <h3 id="promo-popup-title" className="text-balance text-lg font-bold leading-tight">
          {copy.title}
        </h3>
        <p className="text-[13.5px] text-muted-foreground">{copy.body}</p>
        {PROMO.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {PROMO.highlights.map((h) => (
              <span key={h} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                {h}
              </span>
            ))}
          </div>
        )}
        <div className="flex justify-center rounded-lg bg-muted px-3 py-2 text-[13px]">
          <OfferCountdown />
        </div>
        <a
          href={partnerUrl(PLACEMENT)}
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

## 6. 倒计时组件 `src/components/promo/offer-countdown.tsx`

横条和弹窗共用。固定截止时刻、`d hh:mm:ss`、每秒刷新、到期返回 `null`。初始 `now` 用惰性 `useState(() => Date.now())`，避免在 effect 里同步 `setState`（会被 React 编译器 lint 拦）。

```tsx
"use client";

import { useEffect, useState } from "react";
import { useDict } from "@/i18n/context";
import { isOfferActive, offerEndsAtMs, splitCountdown } from "@/lib/promo";

export function OfferCountdown({ className = "" }: { className?: string }) {
  const dict = useDict();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isOfferActive()) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!isOfferActive(now)) return null;

  const t = dict.promo;
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

## 7. 页脚赞助链接

### 产品规则

| 项 | 规则 |
|---|---|
| 位置 | 页脚最底一行，三栏：版权 · **❤️ Sponsored by Partner** · Privacy / Terms |
| 链接属性 | **Dofollow**：只有 `rel="noopener"`，不加 `nofollow` / `sponsored` |
| URL | **裸 URL**（`PROMO.partner.url`），**不带 UTM**——外链权重信号保持干净 |
| 锚文本 | 合作方品牌名本身（对 SEO 最有价值） |
| 追踪 | 点击仍打 `ad_click {placement: "footer_link"}`，不影响统计 |
| 文案 | 字典 `footer.sponsoredBy`，用 `{brand}` 槽位标记锚文本位置，各语言自行排序（日文「{brand} の提供」品牌在前） |

### SEO 注意

页脚外链是**全站每页**都出现的 dofollow 链接。两个自家站点之间做一条没问题；如果往页脚堆第二、第三个外部站点的 dofollow，开始像链接农场，Google 会打折扣。**一条就够。**

### 代码（放在 `footer.tsx` 底部）

```tsx
import { PROMO } from "@/lib/promo";
import { trackAd } from "@/components/promo/track";

// 页脚底行：
// <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
//   <p>{copyright}</p>
//   <SponsoredBy text={t.sponsoredBy} />
//   <div className="flex gap-4">{privacy}{terms}</div>
// </div>

/**
 * "❤️ Sponsored by Partner" — a deliberate dofollow link to the sister site.
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
          href={PROMO.partner.url}
          target="_blank"
          rel="noopener"
          onClick={() => trackAd("ad_click", "footer_link")}
          className="font-medium text-foreground hover:underline underline-offset-[3px]"
        >
          {PROMO.partner.name}
        </a>
        {after}
      </span>
    </p>
  );
}
```

---

## 8. 追踪、A/B、UTM

### 事件 `src/components/promo/track.ts`

同一个事件同时发到 Vercel Analytics 和 GA4（若存在）。没有 Vercel Analytics 的项目把 `track()` 换成自己的上报函数即可。

```ts
"use client";

import { track } from "@vercel/analytics";
import type { AdPlacement, AdVariant } from "@/lib/promo";

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
| `utm_source` | 本站短名，如 `mojicap` | 流量来自哪个站 |
| `utm_medium` | `referral` | 自家站互推的标准写法，不用 display / cpc |
| `utm_campaign` | `<site>_partnership_<yyyyqN>` | 带季度，换活动改这里 |
| `utm_content` | `top_banner` / `corner_popup` | 区分位置，**唯一随位置变化的参数** |

规则：全小写、下划线、无空格无中文。页脚链接**不带 UTM**（见第 7 节）。

---

## 9. 文案与 i18n

字典命名空间 `promo`。所有语言必须 key 对齐（用脚本校验 parity）。Vormly 侧的措辞是固定的，直接复制；只把 `{site}` 换成本站名称。中文版参考：eyebrow「{site} 联合 Vormly AI」，ctaPopup「领取 3 天试用 + 200 积分」，fine「{site} 官方推荐」，c.title「{site} 用户专享福利」。

```json
{
  "promo": {
    "eyebrow": "{site} × Vormly AI",
    "endsIn": "Ends in",
    "day": "d",
    "ctaBanner": "Claim →",
    "ctaPopup": "Claim 3-day trial + 200 credits",
    "fine": "Recommended by {site}",
    "close": "Close",
    "b": {
      "banner": "Seedance, Veo, Kling and Grok Video in one place. Sign up for a 3-day trial + 200 credits.",
      "title": "Every major AI video model, one workspace",
      "body": "{site} × Vormly AI brings Seedance, Veo, Kling, Grok Video and Midjourney together."
    },
    "c": {
      "banner": "3-day trial + 200 free credits for {site} users.",
      "title": "A perk for {site} users",
      "body": "The AI creation suite we recommend to {site} users: images, video and music in one place."
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
- 优惠信息（试用天数、积分）只出现在 `ctaPopup` 和各变体的 `banner` 里，别处不写。
- `{brand}` 槽位只用于页脚。
- 推广文案跟随页面语言，不做「只英文」。

---

## 10. 存储键与生命周期

前缀为 `PROMO.storagePrefix`（示例 `mojicap-promo-vormly`）。

| Key（localStorage 除非注明） | 值 | 生命周期 |
|---|---|---|
| `<prefix>-banner` | 到期时间戳 ms | 关闭后 12h |
| `<prefix>-popup` | 到期时间戳 ms | 关闭后 24h；点 CTA 后也是 24h |
| `<prefix>-popup-session`（sessionStorage） | `"1"` | 本会话 |
| `<prefix>-variant` | `"b"` / `"c"` | 永久（换活动时改前缀即重新分组） |

所有读写都包 `try/catch`：隐私模式、禁用存储、SSR 都不会抛错。

---

## 11. 挂载

```tsx
// app/[locale]/layout.tsx
import { PromoBanner } from "@/components/promo/promo-banner";
import { PromoPopup } from "@/components/promo/promo-popup";

<body>
  <Providers>
    {/* 横条和导航共用一个 sticky 容器；Navbar 自身不再 sticky */}
    <div className="sticky top-0 z-50">
      <PromoBanner />
      <Navbar />
    </div>
    <main className="flex-1">{children}</main>
    <Footer />
    <Toaster />
    <PromoPopup />
  </Providers>
</body>
```

如果站点里有 `sticky top-24` 之类相对导航栏偏移的元素，加了 40px 横条后要复核偏移值。

---

## 12. 接入新项目（约 15 分钟）

1. 复制 `src/lib/promo.ts`、`src/components/promo/*`、`tests/promo.test.ts`。
2. 按第 2 节只填「站点变量」：`site.name`、`site.logo`、`storagePrefix`、`utm.source`、`utm.campaign`、`excludedRoutes`；Vormly 那一块原样保留。
3. 把 Vormly 白色 logotype（`https://vormly.ai/brand/logotype-white.svg`）放到本站 `public/brand/vormly-logotype-white.svg`。
4. 字典：复制第 9 节的 `promo` 和 `footer.sponsoredBy`，把 `{site}` 换成本站名，所有语言对齐。
5. 挂载（第 11 节），把原 Navbar 的 `sticky top-0 z-50` 去掉。
6. 页脚加 `SponsoredBy`。
7. 若无 Vercel Analytics，改 `track.ts` 里的 `track()`。
8. 若无语言前缀路由，`isExcludedRoute(pathname)` 直接传原路径。
9. 跑 `tsc`、lint、`npm test`、build。
10. 按第 13 节清单在**生产构建**（`next start`）+ 浏览器里验收，不要只看 dev。

---

## 13. 验收清单（都是踩过的坑）

- [ ] 弹窗**不点任何东西**、等 5 秒自己出现
- [ ] 弹窗里：品牌组合只出现 1 次；优惠数字只出现 1 次（按钮）；日期文字 0 次（只有倒计时）
- [ ] 头图 logo 和 ✕ 不重叠（取两者 `getBoundingClientRect` 检查）
- [ ] 横条滚动 1000px 后 `top === 0`，导航栏紧贴其下
- [ ] 中文「还剩 14 天」不竖排（`whitespace-nowrap`）
- [ ] 弹窗倒计时和横条倒计时同一时刻同一数字
- [ ] 关闭横条 → 刷新仍隐藏 → localStorage 到期戳 ≈ now + 12h
- [ ] 关闭弹窗 → 刷新仍隐藏 → 到期戳 ≈ now + 24h；点按钮后同样 24h
- [ ] 先清 sessionStorage **再刷新**，弹窗才会再弹（挂载时读取）
- [ ] 排除页两个单元都不出现
- [ ] 手机宽度：弹窗贴底通栏、不全屏；横条只剩品牌 + CTA
- [ ] 两个 UTM 链接分别是 `top_banner` / `corner_popup`；页脚链接无 UTM、无 nofollow
- [ ] 切换语言，三处文案都跟着变
- [ ] 无强调色：横条/按钮/头图都是站点中性色
- [ ] 原型（如有）里 `.banner` 不要在 `position: sticky` 后面再写 `position: relative`——会把 sticky 覆盖掉

---

## 14. 到期与下线

- **到期日到了**：倒计时自动消失，横条和弹窗继续展示。此时要么延期（改 `offerEndsAt`），要么下线。
- **下线**：`enabled: false`，两个单元立即不渲染；页脚链接独立，需要的话单独删。
- **换一轮活动**：改 `offerEndsAt`、`utm.campaign`，并把 `storagePrefix` 改个名——分组、关闭记忆全部重置，关过的人会重新看到。

---

## 附：MojiCap 仓库里的实际文件名

本仓库上线时用的是合作方专名（历史原因），与本文的通用命名对应关系：

| 本文（通用） | 仓库实际 |
|---|---|
| `src/lib/promo.ts` · `PROMO` · `STORAGE` · `partnerUrl` | `src/lib/ads.ts` · `VORMLY_AD` · `VORMLY_AD.storageKeys` · `vormlyUrl` |
| `src/components/promo/promo-banner.tsx` · `PromoBanner` | `src/components/ads/vormly-banner.tsx` · `VormlyBanner` |
| `src/components/promo/promo-popup.tsx` · `PromoPopup` | `src/components/ads/vormly-popup.tsx` · `VormlyPopup` |
| 字典 `promo.*` | 字典 `ads.vormly.*` |
| `PROMO.highlights` | 组件内常量 `MODELS` |

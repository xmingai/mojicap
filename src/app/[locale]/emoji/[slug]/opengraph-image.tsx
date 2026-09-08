import { ImageResponse } from "next/og";
import { getEmojiBySlug } from "@/lib/emoji";
import { getEmojiTranslation } from "@/lib/emoji-i18n";
import type { Locale } from "@/i18n/config";

export const alt = "Emoji — MojiCap";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated on demand (and then cached), not at build time: 3,781 emojis would
// otherwise mean thousands of twemoji fetches during the build.
export function generateStaticParams() {
  return [];
}

export default async function EmojiOgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const emoji = getEmojiBySlug(slug);
  const name = emoji ? getEmojiTranslation(slug, locale as Locale)?.name || emoji.name : "Emoji";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fafafa 0%, #f1f5f9 100%)",
          color: "#0f172a",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 300, display: "flex" }}>{emoji?.emoji ?? "❓"}</div>
        <div style={{ fontSize: 64, fontWeight: 700, marginTop: 12, textTransform: "capitalize" }}>{name}</div>
        <div style={{ fontSize: 30, opacity: 0.55, marginTop: 20 }}>Copy &amp; paste on MojiCap</div>
      </div>
    ),
    { ...size, emoji: "twemoji" }
  );
}

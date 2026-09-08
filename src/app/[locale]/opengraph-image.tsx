import { ImageResponse } from "next/og";

export const alt = "MojiCap — Emoji, Symbols & Kaomoji, Copy & Paste";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Site-wide social card. Applies to every page under [locale] that does not
// define its own opengraph-image (i.e. everything except emoji detail pages).
export default function OgImage() {
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
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #4c1d95 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 132, fontWeight: 800, letterSpacing: -4 }}>MojiCap</div>
        <div style={{ fontSize: 40, opacity: 0.85, marginTop: 8 }}>
          Emoji · Symbols · Kaomoji · Fancy Text
        </div>
        <div style={{ fontSize: 30, opacity: 0.6, marginTop: 28 }}>
          Copy &amp; paste, instantly — www.mojicap.com
        </div>
      </div>
    ),
    { ...size }
  );
}

import { getAllEmojis } from "@/lib/emoji";
import type { MetadataRoute } from "next";

const BASE_URL = "https://emojikit.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const emojis = getAllEmojis();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/emoji`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/symbols`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/fancy-text`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/combos`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  const emojiPages: MetadataRoute.Sitemap = emojis.map((emoji) => ({
    url: `${BASE_URL}/emoji/${emoji.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...emojiPages];
}

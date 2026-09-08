import { generateSitemaps } from "../sitemaps/sitemap";
import { SITE_URL } from "@/lib/seo";

// Sitemap index. Next.js does not emit one automatically for generateSitemaps,
// and keeping it at /sitemap.xml means the URL already registered in Search
// Console and robots.txt keeps working.
export const dynamic = "force-static";

export function GET() {
  const items = generateSitemaps()
    .map(({ id }) => `  <sitemap><loc>${SITE_URL}/sitemaps/sitemap/${id}.xml</loc></sitemap>`)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

import { sitemapIndexXml, XML_HEADERS } from "@/lib/sitemap";

// Sitemap index at the URL already registered in Search Console and robots.txt.
export const dynamic = "force-static";

export function GET() {
  return new Response(sitemapIndexXml(), { headers: XML_HEADERS });
}

import { SITEMAP_FILES, sitemapUrls, urlsetXml, XML_HEADERS } from "@/lib/sitemap";

// Built once at deploy time; any other file name is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return SITEMAP_FILES.map((file) => ({ file }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const urls = sitemapUrls((await params).file);
  if (!urls) return new Response("Not found", { status: 404 });
  return new Response(urlsetXml(urls), { headers: XML_HEADERS });
}

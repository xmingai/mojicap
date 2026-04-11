import https from 'https';

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (redirectUrl.startsWith('/')) {
            const urlObj = new URL(url);
            redirectUrl = `${urlObj.protocol}//${urlObj.host}${redirectUrl}`;
        }
        return fetchText(redirectUrl).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function extractMeta(html, nameOrProperty, value) {
  const regex = new RegExp(`<meta[^>]+(?:name|property)=["']${nameOrProperty}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
  // alternate order
  const regex2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${nameOrProperty}["'][^>]*>`, 'i');
  const match = html.match(regex) || html.match(regex2);
  return match ? match[1] : null;
}

function extractHreflang(html) {
  const regex = /<link[^>]+rel=["']alternate["'][^>]*>/gi;
  const matches = html.match(regex) || [];
  return matches.map(m => {
    const hrefMatch = m.match(/href=["']([^"']+)["']/i);
    const hreflangMatch = m.match(/hreflang=["']([^"']+)["']/i);
    return {
      href: hrefMatch ? hrefMatch[1] : null,
      hreflang: hreflangMatch ? hreflangMatch[1] : null
    };
  });
}

function extractJsonLd(html) {
  const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const matches = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
        matches.push(JSON.parse(match[1]));
    } catch(e) {
        matches.push("INVALID JSON: " + match[1]);
    }
  }
  return matches;
}

function extractTag(html, tag) {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    const matches = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
        matches.push(match[1].replace(/<[^>]+>/g, '').trim().substring(0, 80));
    }
    return matches;
}

async function audit(url) {
  console.log(`\n--- Auditing ${url} ---`);
  const html = await fetchText(url);
  
  console.log("Title:", extractTag(html, 'title')[0]);
  console.log("Description:", extractMeta(html, 'description') || extractMeta(html, 'og:description'));
  console.log("Canonical:", html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]);
  console.log("H1 Count:", extractTag(html, 'h1').length, "->", extractTag(html, 'h1')[0]);
  console.log("H1 Source:", html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]);
  console.log("Hreflang tags:");
  extractHreflang(html).forEach(h => console.log(`  ${h.hreflang}: ${h.href}`));
  const jsonld = extractJsonLd(html);
  console.log("JSON-LD blocks:", jsonld.length);
  if (jsonld.length > 0) {
      console.log("Types:", jsonld.map(j => j["@type"] || (Array.isArray(j) ? j.map(x=>x["@type"]).join(',') : 'unknown')));
  }
}

async function run() {
  try {
    await audit('https://mojicap.com/');
    await audit('https://mojicap.com/zh');
    await audit('https://mojicap.com/emoji/grinning-face');
  } catch (e) {
    console.error(e);
  }
}

run();

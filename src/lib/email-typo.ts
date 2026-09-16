/**
 * Catch the typo that silently costs an account.
 *
 * A code goes to whatever address is typed, so "gmial.com" produces a
 * confident "code sent" and a code nobody will ever read. We can't verify a
 * mailbox exists, but a misspelt popular domain is easy to spot: it is one or
 * two edits away from a domain almost everyone uses.
 */

// The domains our visitors actually use, by market.
const COMMON_DOMAINS = [
  "gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com", "msn.com",
  "yahoo.com", "yahoo.co.jp", "icloud.com", "me.com", "aol.com",
  "proton.me", "protonmail.com", "zoho.com", "gmx.com", "web.de",
  "qq.com", "foxmail.com", "163.com", "126.com", "sina.com", "sohu.com", "aliyun.com",
  "naver.com", "daum.net", "hanmail.net", "kakao.com",
  "yandex.ru", "mail.ru", "bk.ru", "list.ru",
  "orange.fr", "free.fr", "laposte.net", "hotmail.fr", "hotmail.es",
  "uol.com.br", "bol.com.br", "terra.com.br",
];

/**
 * Edit distance that counts a swap of neighbouring letters as one mistake
 * (Damerau-Levenshtein): "gmial" is one slip of the fingers from "gmail", not
 * two. Capped — anything past `max` is not worth measuring.
 */
function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const rows: number[][] = [Array.from({ length: b.length + 1 }, (_, j) => j)];
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(rows[i - 1][j] + 1, row[j - 1] + 1, rows[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, rows[i - 2][j - 2] + 1);
      }
      row[j] = value;
    }
    rows[i] = row;
    if (Math.min(...row) > max) return max + 1;
  }
  return rows[a.length][b.length];
}

/**
 * A likely correction for the domain, or null when the address looks fine.
 * Returns the whole address so the caller can offer it as-is.
 *
 * Two mistakes are worth correcting, and they need different rules:
 *   the suffix slipped — "qq.con", "163.co": the name is exactly right, so the
 *     match is certain however short the name is;
 *   the name slipped — "gmial.com", "hotmial.com": only corrected for names
 *     long enough that a near miss cannot be a different provider ("we.com" is
 *     one edit from "me.com" and must be left alone).
 */
export function suggestEmailFix(email: string): string | null {
  const trimmed = email.trim();
  const at = trimmed.lastIndexOf("@");
  if (at < 1) return null;

  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1).toLowerCase();
  if (!domain.includes(".") || COMMON_DOMAINS.includes(domain)) return null;

  const cut = domain.indexOf(".");
  const [name, suffix] = [domain.slice(0, cut), domain.slice(cut + 1)];
  if (!name || !suffix) return null;

  const fix = (candidate: string) => `${local}@${candidate}`;

  for (const candidate of COMMON_DOMAINS) {
    const candidateCut = candidate.indexOf(".");
    if (candidate.slice(0, candidateCut) === name && distance(suffix, candidate.slice(candidateCut + 1), 2) <= 2) {
      return fix(candidate);
    }
  }

  let best: { domain: string; score: number } | null = null;
  for (const candidate of COMMON_DOMAINS) {
    const candidateCut = candidate.indexOf(".");
    const candidateName = candidate.slice(0, candidateCut);
    if (candidateName.length < 4 || candidate.slice(candidateCut + 1) !== suffix) continue;
    const max = candidateName.length >= 6 ? 2 : 1;
    const score = distance(name, candidateName, max);
    if (score > 0 && score <= max && (!best || score < best.score)) best = { domain: candidate, score };
  }
  return best ? fix(best.domain) : null;
}

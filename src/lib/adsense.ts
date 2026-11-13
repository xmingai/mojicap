/**
 * Google AdSense (Auto ads). The publisher id is public by design: it appears in
 * every page's script tag and in /ads.txt.
 *
 * Ad-free is a Plus benefit, so the loader only runs once the account check has
 * answered and the visitor is not a member.
 */

export const ADSENSE_CLIENT = "ca-pub-3504612037018677";

export const ADSENSE_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

/** Route prefixes (locale-free) where the ad script is never loaded: the checkout and account pages. */
const EXCLUDED_ROUTES = ["/pricing", "/account"];

export function isAdSenseExcluded(localeFreePath: string): boolean {
  return EXCLUDED_ROUTES.some((r) => localeFreePath === r || localeFreePath.startsWith(`${r}/`));
}

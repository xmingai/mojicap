import test from "node:test";
import assert from "node:assert/strict";
import {
  VORMLY_AD,
  vormlyUrl,
  isOfferActive,
  offerEndsAtMs,
  isExcludedRoute,
  dismissalExpiry,
  splitCountdown,
} from "../src/lib/ads.ts";

test("vormlyUrl carries the standard UTM set and only utm_content varies", () => {
  const banner = new URL(vormlyUrl("top_banner"));
  const popup = new URL(vormlyUrl("corner_popup"));
  for (const u of [banner, popup]) {
    assert.equal(u.origin + u.pathname, "https://vormly.ai/");
    assert.equal(u.searchParams.get("utm_source"), "mojicap");
    assert.equal(u.searchParams.get("utm_medium"), "referral");
    assert.equal(u.searchParams.get("utm_campaign"), "mojicap_partnership_2026q3");
  }
  assert.equal(banner.searchParams.get("utm_content"), "top_banner");
  assert.equal(popup.searchParams.get("utm_content"), "corner_popup");
});

test("UTM values are lowercase snake_case without spaces", () => {
  const u = new URL(vormlyUrl("top_banner"));
  for (const [, v] of u.searchParams) assert.match(v, /^[a-z0-9_]+$/);
});

test("offer is active before the fixed deadline and inactive after", () => {
  const end = offerEndsAtMs();
  assert.equal(isOfferActive(end - 1000), true);
  assert.equal(isOfferActive(end + 1000), false);
});

test("excluded routes are matched locale-free, with sub-paths", () => {
  assert.equal(isExcludedRoute("/privacy"), true);
  assert.equal(isExcludedRoute("/terms/"), true);
  assert.equal(isExcludedRoute("/about/team"), true);
  assert.equal(isExcludedRoute("/emoji"), false);
  assert.equal(isExcludedRoute("/aboutus"), false);
});

test("dismissal expiry and countdown split", () => {
  const now = 1_000_000;
  assert.equal(dismissalExpiry(3, now), now + 3 * 864e5);
  assert.deepEqual(splitCountdown(2 * 864e5 + 3 * 3600e3 + 4 * 60e3 + 5000), { days: 2, hours: 3, minutes: 4, seconds: 5 });
  assert.deepEqual(splitCountdown(-5), { days: 0, hours: 0, minutes: 0, seconds: 0 });
  assert.deepEqual(VORMLY_AD.variants, ["b", "c"]);
  assert.equal(VORMLY_AD.bannerDismissDays, 0.5); // banner comes back 12h after being closed
  assert.equal(VORMLY_AD.popupDismissDays, 1); // popup comes back 24h after close…
  assert.equal(VORMLY_AD.popupClickDays, 1); // …and 24h after a CTA click
  assert.equal(dismissalExpiry(VORMLY_AD.bannerDismissDays, now), now + 12 * 3600e3);
});

#!/usr/bin/env node
/**
 * Idempotent Waffo catalog setup for MojiCap Plus — creates or updates the
 * subscription products from src/lib/membership/plans.ts and regenerates
 * src/lib/membership/waffo-catalog.generated.ts. Ported from PixFlow's script.
 *
 * Every product carries its SKU in metadata, and re-running is always safe: a
 * SKU already in the catalog file is UPDATED in place, never duplicated.
 *
 * Usage (Node 22+, from the repo root):
 *   export WAFFO_MERCHANT_ID=MER_…
 *   export WAFFO_STORE_ID=STO_0ip4NuuvjBGmQghudqq37j
 *   export WAFFO_PRIVATE_KEY_FILE=./waffo-private.pem     # or WAFFO_PRIVATE_KEY
 *   node --experimental-strip-types scripts/waffo-setup.mjs            # dry run: prints the plan, calls nothing
 *   node --experimental-strip-types scripts/waffo-setup.mjs --write    # create/update products + write catalog
 *   node --experimental-strip-types scripts/waffo-setup.mjs --webhook https://www.mojicap.com/api/webhooks/waffo/
 *   node --experimental-strip-types scripts/waffo-setup.mjs --publish  # promote test → production
 *
 * Products are born in the TEST environment and `--publish` promotes the same
 * ids to production, so the catalog file survives launch untouched. Going live:
 *   1. --publish
 *   2. --webhook <prod-url> with WAFFO_ENV=production
 *   3. set WAFFO_* in Vercel with WAFFO_ENV=production
 * (Store KYB review must have passed; the API answers 403 until it has.)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";

const { PLANS } = await import(new URL("../src/lib/membership/plans.ts", import.meta.url));
const { WAFFO_PRODUCT_IDS } = await import(new URL("../src/lib/membership/waffo-catalog.generated.ts", import.meta.url));
const { WaffoPancake } = await import("@waffo/pancake-ts");

const MERCHANT_ID = process.env.WAFFO_MERCHANT_ID;
const STORE_ID = process.env.WAFFO_STORE_ID;
const PRIVATE_KEY = process.env.WAFFO_PRIVATE_KEY_FILE
  ? readFileSync(process.env.WAFFO_PRIVATE_KEY_FILE, "utf-8")
  : process.env.WAFFO_PRIVATE_KEY;

if (!MERCHANT_ID || !PRIVATE_KEY || !STORE_ID) {
  console.error("Set WAFFO_MERCHANT_ID, WAFFO_STORE_ID and WAFFO_PRIVATE_KEY (or WAFFO_PRIVATE_KEY_FILE)");
  process.exit(1);
}

const ENV = process.env.WAFFO_ENV === "production" ? "production" : "test";
const WRITE = process.argv.includes("--write");
const PUBLISH = process.argv.includes("--publish");
const webhookFlag = process.argv.indexOf("--webhook");
let WEBHOOK_URL = webhookFlag >= 0 ? process.argv[webhookFlag + 1] : null;
// next.config sets trailingSlash: true, so the route lives at …/waffo/ and the
// slash-less URL answers 308. Don't rely on the sender following redirects.
if (WEBHOOK_URL && !WEBHOOK_URL.endsWith("/")) WEBHOOK_URL += "/";

// Without an action flag, only print what would happen. Creating products and
// then not recording their ids would make the next --write create duplicates.
if (!WRITE && !PUBLISH && !WEBHOOK_URL) {
  console.log(`Dry run — ${ENV} environment. Nothing is sent to Waffo.\n`);
  for (const plan of PLANS) {
    const existing = WAFFO_PRODUCT_IDS[plan.sku];
    console.log(`  ${existing ? "=" : "+"} ${plan.sku.padEnd(14)} ${existing || "(new)"} ($${plan.priceUsd}/${plan.interval})`);
  }
  console.log("\nPass --write to create/update these products and record their ids.");
  process.exit(0);
}

const client = new WaffoPancake({ merchantId: MERCHANT_ID, privateKey: PRIVATE_KEY, environment: ENV === "production" ? "prod" : "test" });

console.log(`Waffo catalog setup — ${ENV} environment, ${PLANS.length} products\n`);

const result = {};
for (const plan of PLANS) {
  // taxIncluded: Waffo is merchant of record; the advertised price is what the buyer pays.
  const prices = { [plan.currency]: { amount: plan.price.toFixed(2), taxIncluded: true, taxCategory: "saas" } };
  // Subscriptions elsewhere, one-time products in China: Waffo only offers
  // WeChat Pay on one-time CNY products. No trialDays either way — no trials.
  const onetime = plan.kind === "onetime";
  const resource = onetime ? client.onetimeProducts : client.subscriptionProducts;
  const common = { name: plan.productName, prices, metadata: { sku: plan.sku }, ...(onetime ? {} : { billingPeriod: plan.interval }) };
  const existing = WAFFO_PRODUCT_IDS[plan.sku];
  const label = `${plan.price} ${plan.currency}/${plan.interval}${onetime ? " one-time" : ""}`;

  if (existing) {
    const { product } = await resource.update({ id: existing, ...common });
    result[plan.sku] = product?.id ?? existing;
    console.log(`  = ${plan.sku.padEnd(16)} ${result[plan.sku]} (${label})`);
  } else {
    const { product } = await resource.create({ storeId: STORE_ID, ...common });
    result[plan.sku] = product.id;
    console.log(`  + ${plan.sku.padEnd(16)} ${product.id} (${label})`);
  }

  if (PUBLISH) {
    await resource.publish({ id: result[plan.sku] });
    console.log("    ↑ published to production");
  }
}

if (WEBHOOK_URL) {
  await client.webhooks.add({
    storeId: STORE_ID,
    channel: "http",
    url: WEBHOOK_URL,
    events: [
      // One-time purchases (China/WeChat) report through order.completed only.
      "order.completed",
      "subscription.activated",
      "subscription.payment_succeeded",
      "subscription.canceling",
      "subscription.uncanceled",
      "subscription.canceled",
      "subscription.past_due",
      "refund.succeeded",
      "refund.failed",
    ],
    testMode: ENV === "test",
  });
  console.log(`\n  + webhook (${ENV}) → ${WEBHOOK_URL}`);
}

const fileBody = `/**
 * Waffo product ids per SKU — GENERATED by scripts/waffo-setup.mjs, do not edit
 * by hand. An empty string means the product has not been created in Waffo
 * yet; checkout for that SKU fails fast with a clear error.
 *
 * Regenerate after creating or changing products:
 *   WAFFO_MERCHANT_ID=MER_… WAFFO_STORE_ID=STO_… WAFFO_PRIVATE_KEY_FILE=./waffo-private.pem \\
 *     node --experimental-strip-types scripts/waffo-setup.mjs --write
 */
export const WAFFO_PRODUCT_IDS: Record<string, string> = {
${PLANS.map((p) => `  ${p.sku}: ${JSON.stringify(result[p.sku] ?? "")},`).join("\n")}
};
`;

if (WRITE) {
  const target = resolve(dirname(fileURLToPath(import.meta.url)), "../src/lib/membership/waffo-catalog.generated.ts");
  writeFileSync(target, fileBody);
  console.log(`\nWrote ${target}`);
} else {
  // Products were created or changed but not recorded: print the ids so they can be saved by hand.
  console.log(`\n--write not passed; save these ids in waffo-catalog.generated.ts:\n\n${fileBody}`);
}

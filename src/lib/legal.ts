/**
 * The facts Waffo's account review checks for on /terms and /privacy: a real
 * legal entity, real contact channels, and billing terms that match what we
 * actually charge. Kept in one place so the two pages can never disagree.
 */

import { plansFor } from "./membership/plans";

/** Operator of MojiCap. An individual trader, so no business address is published. */
export const LEGAL_NAME = "Pan Ming";

export const SUPPORT_EMAIL = "support@mojicap.com";

/** Waffo is the merchant of record: it sells to the customer and handles the money. */
export const MERCHANT_OF_RECORD = "Waffo Pancake (Waffo.com Limited)";

/** Full refund window for a first purchase, in days. */
export const REFUND_DAYS = 7;

/** Bumped by hand when the text changes — a build date would move on every deploy. */
export const LEGAL_UPDATED = "16 September 2026";

export const GOVERNING_LAW = "the laws of the People's Republic of China";

/** Prices quoted in the legal pages, straight from the plan table. */
export const GLOBAL_PLANS = plansFor("global");
export const CN_PLANS = plansFor("cn");

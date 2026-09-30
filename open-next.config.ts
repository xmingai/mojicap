import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

// ISR pages and the data cache live in R2. No revalidation queue and no tag
// cache: nothing here revalidates on a timer or by tag - emoji pages outside
// English render once on first visit and stay until the next deploy.
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  // Answer cached pages before Next runs, from the revalidate value stored with
  // each R2 entry. Without it every isolate that did not render a page itself
  // treats it as stale after one second (Next keeps freshness in memory), so
  // on-demand pages were re-rendered and rewritten to R2 on almost every
  // request - found on logobase, which runs the same setup. Incompatible with
  // PPR, which this app does not use.
  enableCacheInterception: true,
});

#!/usr/bin/env bash
# Build and deploy to Cloudflare Workers without leaking secrets.
#
# OpenNext bakes the values of .env, .env.local and .env.production into the
# uploaded worker. Production secrets belong in `wrangler secret`, so this
# script moves every secret-bearing env file aside for the build, refuses to
# deploy if anything but NEXT_PUBLIC_* reached the bundle, and puts the files
# back whatever happens. Prefer Cloudflare's git build (Workers Builds), which
# never sees these files; this is the safe way to deploy by hand.
set -euo pipefail
cd "$(dirname "$0")/.."

# Wrangler needs Node 22+; fail before a five-minute build, not after it.
major=$(node -p 'process.versions.node.split(".")[0]')
if [ "$major" -lt 22 ]; then
  echo "Node $(node -v) is too old: Wrangler needs Node 22+ (try: nvm use 22)" >&2
  exit 1
fi

STASH="$(mktemp -d)"
FILES=(.env .env.local .env.production.local .dev.vars)
restore() { for f in "${FILES[@]}"; do [ -e "$STASH/$f" ] && mv "$STASH/$f" "$f"; done; rmdir "$STASH" 2>/dev/null || true; }
trap restore EXIT
for f in "${FILES[@]}"; do [ -e "$f" ] && mv "$f" "$STASH/$f"; done

npx opennextjs-cloudflare build

# Only public, build-time values may be embedded.
leaked=$(node -e '
  import("./.open-next/cloudflare/next-env.mjs").then((m) => {
    const keys = Object.values(m).flatMap((o) => Object.keys(o));
    console.log(keys.filter((k) => !k.startsWith("NEXT_PUBLIC_")).join(" "));
  });')
if [ -n "$leaked" ]; then
  echo "Refusing to deploy: non-public env vars in the bundle: $leaked" >&2
  exit 1
fi

# One character above U+00FF anywhere in the script makes V8 store all of it
# (~57M characters) as UTF-16, doubling the isolate's memory next to the 128MB
# limit. Bundle as wrangler would and refuse if that happened.
CHECK="$(mktemp -d)"
npx wrangler deploy --dry-run --outdir "$CHECK" >/dev/null
node scripts/check-latin1.mjs "$CHECK/worker.js"
rm -rf "$CHECK"

npx opennextjs-cloudflare deploy

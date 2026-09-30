// Fails if a bundled Worker script contains any character above U+00FF.
// V8 picks one representation for a whole script from its widest character, so
// a single "—" in a comment makes the entire ~57M-character source UTF-16 —
// twice the isolate memory, against a 128MB limit. See scripts/cf-deploy.sh.
import { readFileSync } from "node:fs";

const file = process.argv[2];
const source = readFileSync(file, "utf8");
const wide = [];
for (let i = 0; i < source.length && wide.length < 5; i++) {
  if (source.charCodeAt(i) > 0xff) wide.push(i);
}
if (wide.length) {
  for (const i of wide) {
    console.error(`U+${source.codePointAt(i).toString(16).toUpperCase()} at ${i}: …${source.slice(Math.max(0, i - 80), i + 20)}…`);
  }
  console.error(`${file}: characters above U+00FF found; escape them (or drop them from comments) before deploying.`);
  process.exit(1);
}
console.log(`${file}: Latin-1 only (${source.length.toLocaleString()} characters)`);

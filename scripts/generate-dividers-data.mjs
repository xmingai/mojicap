#!/usr/bin/env node
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");

const dividers = [
  { category: "Stars", items: ["⋆┈┈｡ﾟ❃ུ۪ ❀ུ۪ ❁ུ۪ ❃ུ۪ ❀ུ۪ ﾟ｡┈┈⋆", "────── ⋆⋅☆⋅⋆ ──────", "✩｡:*•.───── ❁ ❁ ─────.•*:｡✩", "✧･ﾟ: *✧･ﾟ:* 　　 *:･ﾟ✧*:･ﾟ✧", ".・゜゜・　　・゜゜・．", "｡･ﾟﾟ･　　･ﾟﾟ･｡", "»»————- ★ ————-««", "══✿══╡°˖✧✿✧˖°╞══✿══", "★。＼｜／。★", "★。／｜＼。★"] },
  { category: "Hearts", items: ["─── ❤️ ───", "♡₊˚ 🦢・₊✧", "❤♡❤♡❤♡❤♡❤♡❤♡❤♡", "♡♡♡♡♡♡♡♡♡♡", "─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───", "♥*♡+:｡.｡ 　　 ｡.｡:+♡*♥", "°。°。°。°。°。°。°。゜。°。", "ʚ♡ɞ ʚ♡ɞ ʚ♡ɞ"] },
  { category: "Flowers", items: ["❀。• *₊°。 ❀°。", "✿ ✿ ✿ ✿ ✿ ✿", "❃.✮:▹　　◃:✮.❃", "‧͙⁺˚*･༓☾　　☽༓･*˚⁺‧͙", "✻ ✼ ❄ ❅ ❆ ❇ ❈ ❉ ❊ ❋", "✽ ✾ ✿ ❀ ❁ ❂ ❃ ❄ ❅ ❆ ❇ ❈ ❉ ❊ ❋"] },
  { category: "Borders", items: ["╔════════════════════╗", "╚════════════════════╝", "╭──────────╮", "╰──────────╯", "┏━━━━━━━━━━━━━━━┓", "┗━━━━━━━━━━━━━━━┛", "┍━━━━━━━★━━━━━━━┑", "┕━━━━━━━★━━━━━━━┙"] },
  { category: "Lines", items: ["━━━━━━━━━━━━━━━━━━━━", "────────────────────", "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬", "➖➖➖➖➖➖➖➖➖➖➖➖➖➖", "〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️", "﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏"] },
  { category: "Arrows", items: ["←─────→", "◁◁ Ⅱ   ▷▷", "◀◁◀◁◀◁◀◁◀◁◀", "▶▷▶▷▶▷▶▷▶▷▶", "↢ ↢ ↢ ↢ ↣ ↣ ↣ ↣", "⇦ ⇦ ⇦ ⇦ ⇨ ⇨ ⇨ ⇨"] },
  { category: "Sparkles", items: ["✨✨✨✨✨✨✨✨✨", "˚ ༘♡ ⋆｡˚", "ੈ✩‧₊˚", "☆♬○♩●♪✧♩", "♩✧♪●♩○♬☆", "☄. *. ⋆", "⋆·˚ ༘ *"] },
  { category: "Aesthetic", items: ["⊹ ⊹ ⊹ ⊹ ⊹ ⊹ ⊹ ⊹", "┊ ┊ ┊ ┊ ┊ ┊", "┊ ┊ ┊ ┊ ˚✩ ⋆｡˚ ✩", "┊ ┊ ┊ ✫", "┊ ┊ ☪︎⋆", "┊ ⊹", "✯ ⋆ ┊ . ˚", "˚✩"] }
];

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });
  const data = dividers.map((group, index) => ({
    id: index,
    category: group.category,
    dividers: group.items.map(item => ({
      divider: item
    }))
  }));

  writeFileSync(join(DATA_DIR, "dividers-data.json"), JSON.stringify(data, null, 2));
  console.log(`Done! Exported ${data.reduce((acc, g) => acc + g.dividers.length, 0)} dividers across ${data.length} categories.`);
}

main().catch(console.error);

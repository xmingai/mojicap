#!/usr/bin/env node
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");

const raw = {
  smile: ["☺︎", "⑅◡̈*", "(*◡̈)", "（´∀｀）", "(╹◡╹)", "(´ー｀)", "(*´ `)", "(˙˘˙*)", "っ´꒳｀c)", "(*´꒳`*)", "(⁎ᵕᴗᵕ⁎)", "(*´∇`*)", "(*´ω`*)", "(◍′◡‵◍)", "(*^ω^*)", "( ´ω` )", "(๑•ᴗ•๑)", "(﹡ˆ﹀ˆ﹡)", "(●´ω｀●)", "(*´˘`*)", "(ˊ˘ˋ* )♡", "(๑˃̵ᴗ˂̵)", "(꒪˙꒳˙꒪ )", "(*ˊᗜˋ*)♡", "(๑´ω`๑)♡", "(｡˃ ᵕ ˂。)", "(,,>᎑<,,)", "(˶• ֊ •˶)"],
  laugh: ["(≧▽≦)", "( ﾟ∀ﾟ)ｱﾊﾊ", "( ＾∀＾)", "(๑˃▿˂๑)", "ꉂꉂ(>ᗨ<*)", "(ﾉ∀≦｡)ﾉ", "((*≧艸≦)ﾌﾟﾌﾟ", "ꉂꉂ(๑˃▽˂๑)"],
  cry: ["(╥_╥)", "( ；∀；)", "( ; ω ; )", "(T_T)", "(ToT)", "(´;ω;`)", "( ; ω ; )", "( ͒ ́ඉ .̫ ඉ ̀ ͒)", "(ó﹏ò｡)"],
  anger: ["(╯°□°）╯︵ ┻━┻", "(╬ Ò ‸ Ó)", "(｀_´)ゞ", "( ಠ ಠ )", "凸(｀0´)凸", "(๑•̀ㅂ•́)و✧"],
  greeting: ["(^_^)/", "( ´ ▽ ` )ﾉ", "(ヾ(´･ω･｀)", "(。･ω･)ﾉﾞ", "ヾ(^ω^*)", "(=ﾟωﾟ)ﾉ"],
  love: ["(♥ω♥*)", "(灬♥ω♥灬)", "(๑♡⌓♡๑)", "(´♡‿♡`)", "(✿ ♥‿♥)", "(♡μ_μ)", "(*♡∀♡)"],
  cat: ["(=^・ω・^=)", "(=^･ｪ･^=)", "(=①ω①=)", "(= ; ｪ ; =)", "(=`ω´=)", "(=^‥^=)", "( =ノωヽ=)", "(=⌒‿‿⌒=)"],
  bear: ["ʕ•ᴥ•ʔ", "ʕ·ᴥ·ʔ", "ʕ•̀ω•́ʔ✧", "ʕ ᵔᴥᵔ ʔ", "ʕ； •`ᴥ•´ʔ", "ʕ •ᴥ• ʔ", "ʕ•㉨•ʔ", "ʕ≧㉨≦ʔ"],
  dog: ["U・ᴥ・U", "V●ᴥ●V", "U^ｪ^U", "U ´ᴥ` U", "U・x・U", "∪･ω･∪", "∪･ｪ･∪", "V=(° °)=V"],
  magic: ["(ﾉ>ω<)ﾉ :｡･:*:･ﾟ’★,｡･:*:･ﾟ’☆", "╰( ͡° ͜ʖ ͡° )つ──☆*:・ﾟ", "(∩^o^)⊃━☆", "(∩｀-´)⊃━☆ﾟ.*･｡ﾟ"]
};

const MAPPING = {
  smile: { icon: "😀", name: "Smile (开心)" },
  laugh: { icon: "😆", name: "Laugh (大笑)" },
  cry: { icon: "😢", name: "Cry (哭泣)" },
  anger: { icon: "😡", name: "Anger (生气)" },
  greeting: { icon: "👋", name: "Greeting (问候)" },
  love: { icon: "😍", name: "Love (喜爱)" },
  cat: { icon: "🐱", name: "Cat (猫猫)" },
  bear: { icon: "🐻", name: "Bear (熊只)" },
  dog: { icon: "🐶", name: "Dog (狗狗)" },
  magic: { icon: "✨", name: "Magic (魔法)" }
};

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });
  
  const formattedData = [];
  let currentId = 0;

  for (const [key, meta] of Object.entries(MAPPING)) {
    const list = raw[key];
    if (!list) continue;
    
    formattedData.push({
      id: currentId++,
      category: meta.name,
      icon: meta.icon,
      slug: key,
      kaomojis: list.map(item => ({
        text: item
      }))
    });
  }

  writeFileSync(join(DATA_DIR, "kaomoji-data.json"), JSON.stringify(formattedData, null, 2));
  const total = formattedData.reduce((acc, cat) => acc + cat.kaomojis.length, 0);
  console.log(`Done! Exported ${total} kaomojis across ${formattedData.length} categories.`);
}

main().catch(console.error);

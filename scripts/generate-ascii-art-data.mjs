#!/usr/bin/env node
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");

const asciiArt = [
  { category: "Weapons", art: ["︻デ═一", "︻ガン═一", "▄︻̷̿┻̿═━一", "⌐╦╦═─", "─=≡Σ((( つ◕ل͜◕)つ", "o()xxxx[{::::::::::::::::::>", "cxxxx{}::::::::::::::::::::::::::::::::::::>", "▬▬ι═══════ﺤ", "(-_・)▄︻┻┳═一", "⤜(ⱺ ⱹ)⤏"] },
  { category: "Animals", art: ["/╲/\\╭ºoº╮/\\╱\\", "₍⸍⸌̣ʷ̣̫⸍̣⸌₎", "=^_^=", "(^・ω・^ )", "/╲/\\╭( ͡°͡° ͜ʖ ͡°͡°)╮/\\╱\\", "/ᐠ｡ꞈ｡ᐟ\\", "U・ᴥ・U", "(ᵔᴥᵔ)", "ʕ•ᴥ•ʔ", "(=^･ω･^=)", "(\\/)(;,,;)(\\/)"] },
  { category: "Faces", art: ["( ͡° ͜ʖ ͡°)", "¯\\_(ツ)_/¯", "ಠ_ಠ", "(ง ͠° ͟ل͜ ͡°)ง", "༼ つ ◕_◕ ༽つ", "(づ￣ ³￣)づ", "(ง'̀-'́)ง", "ʕ•ᴥ•ʔ", "(ಥ﹏ಥ)", "ᕦ(ò_óˇ)ᕤ", "( ✧≖ ͜ʖ≖)", "(ﾉ◕ヮ◕)ﾉ*:・ﾟ✧"] },
  { category: "Music", art: ["(ノ-_-)ノ♩♭♪", "♬♫♪◖(●_●)◗♪♫♬", "♪┏(・o･)┛♪┗ ( ･o･) ┓♪", "(*￣0￣)θ～♪", "ヾ(´〇`)ﾉ♪♪♪", "ᕕ( ᐛ )ᕗ", "└(＾＾)┐"] },
  { category: "One Line Magic", art: ["(∩｀-´)⊃━☆ﾟ.*･｡ﾟ", "╰( ͡° ͜ʖ ͡° )つ──☆*:・ﾟ", "(∩^o^)⊃━☆", "(ﾉ>ω<)ﾉ :｡･:*:･ﾟ’★,｡･:*:･ﾟ’☆", "☆*:.｡.o(≧▽≦)o.｡.:*☆"] },
  { category: "Lenny Faces", art: ["( ͡~ ͜ʖ ͡°)", "( ͡° ͜ʖ ͡°)", "( ͡° ͜ʖ ͡°)>⌐■-■", "(⌐■_■)", "( ͡ಠ ʖ̯ ͡ಠ)", "( ͡° ͜ʖ ͡°)╭∩╮"] },
  { category: "Multi-line", art: [
`  \\_\\_    _/_/
      \\__/
      (oo)\\_______
      (__)\\       )\\/\\
          ||----w |
          ||     ||`,
`
|\\---/|
| o_o |
 \\_^_/
`,
`
  / \\__
 (    @\\___
 /         O
/   (_____/
/_____/   U
`,
`
    _
   | |
   | |===( )   //////
   |_|   |||  | o o|
          ||| ( c  )                  ____
           ||| \\= /                  ||   \\_
            ||||||                   ||     |
            ||||||                ...||__/|-"
            ||||||             __|________|__
              |||             |______________|
              |||             || ||      || ||
              |||             || ||      || ||
---------------------------------------------------------
`
  ] }
];

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });
  const data = asciiArt.map((group, index) => ({
    id: index,
    category: group.category,
    art: group.art.map(item => ({
      content: item
    }))
  }));

  writeFileSync(join(DATA_DIR, "ascii-art-data.json"), JSON.stringify(data, null, 2));
  console.log(`Done! Exported ${data.reduce((acc, g) => acc + g.art.length, 0)} ascii art items across ${data.length} categories.`);
}

main().catch(console.error);

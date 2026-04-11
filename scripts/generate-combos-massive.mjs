import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const THEMES = [
  {
    category: "Aesthetic",
    slug: "aesthetic",
    icon: "✨",
    keywords: ["cute", "vibes", "tumblr", "pretty"],
    groups: [
      { core: ["✨", "🤍", "☁️", "🕊️"], accents: ["🏹", "🌸", "🎀", "🧸"] },
      { core: ["🖤", "🕷️", "🔪", "⛓️"], accents: ["🥀", "🦇", "🩸", "🕸️"] },
      { core: ["🍓", "🍰", "🎀", "🩰"], accents: ["🍼", "🐰", "💕", "🧸"] }
    ]
  },
  {
    category: "Nature & Cottagecore",
    slug: "nature",
    icon: "🌱",
    keywords: ["outdoors", "plants", "forest", "green"],
    groups: [
      { core: ["🌱", "🍄", "🐸", "🍃"], accents: ["🦋", "🐌", "🪵", "🌿"] },
      { core: ["🌧️", "🌩️", "💧", "☔"], accents: ["☕", "📚", "🕯️", "🧣"] },
      { core: ["🌻", "☀️", "🐝", "🧺"], accents: ["🍋", "🍯", "🌼", "🚜"] }
    ]
  },
  {
    category: "Space & Cyber",
    slug: "space",
    icon: "🌌",
    keywords: ["galaxy", "stars", "alien", "future", "tech"],
    groups: [
      { core: ["🌌", "☄️", "🪐", "🔭"], accents: ["✨", "🚀", "👽", "🌙"] },
      { core: ["👾", "🛸", "🤖", "⚡"], accents: ["🎮", "💻", "🟢", "💥"] }
    ]
  },
  {
    category: "Food & Cafe",
    slug: "food",
    icon: "☕",
    keywords: ["drink", "eat", "cafe", "restaurant", "meal"],
    groups: [
      { core: ["🥐", "☕", "🤎", "🍂"], accents: ["📖", "🕰️", "🥨", "🥞"] },
      { core: ["🍣", "🍜", "🥢", "🍙"], accents: ["🍥", "🍵", "⛩️", "🍱"] },
      { core: ["🍔", "🍟", "🥤", "🌭"], accents: ["🍕", "🍿", "🍗", "🥪"] }
    ]
  },
  {
    category: "Love & Valentines",
    slug: "love",
    icon: "💕",
    keywords: ["romantic", "heart", "couple", "dating", "passion"],
    groups: [
      { core: ["💕", "🧸", "💌", "🥺"], accents: ["💖", "🎀", "🍫", "🌹"] },
      { core: ["👩‍❤️‍💋‍👨", "💍", "✨", "🥂"], accents: ["💒", "💐", "♥️", "💋"] }
    ]
  },
  {
    category: "Animals & Pets",
    slug: "animals",
    icon: "🐾",
    keywords: ["dogs", "cats", "pets", "wildlife", "cute"],
    groups: [
      { core: ["🐈‍⬛", "🐾", "🧶", "🐟"], accents: ["🥺", "🥛", "💤", "🐁"] },
      { core: ["🐕", "🦴", "🎾", "🦮"], accents: ["🐾", "🏡", "🥩", "💖"] },
      { core: ["🐇", "🥕", "🌸", "🐰"], accents: ["🥬", "💕", "✨", "🌷"] }
    ]
  },
  {
    category: "Fantasy & Magic",
    slug: "fantasy",
    icon: "🧚‍♀️",
    keywords: ["wizard", "spells", "fairy", "dragon", "RPG"],
    groups: [
      { core: ["🧚‍♀️", "🍄", "✨", "🦋"], accents: ["🌸", "🪄", "🌿", "🦄"] },
      { core: ["🧙‍♂️", "🔮", "🌙", "📜"], accents: ["🕯️", "🦉", "🗡️", "🍷"] },
      { core: ["🐉", "🔥", "🏰", "⚔️"], accents: ["🛡️", "👑", "🩸", "🌋"] }
    ]
  },
  {
    category: "Holidays",
    slug: "holidays",
    icon: "🎄",
    keywords: ["christmas", "halloween", "celebration", "party"],
    groups: [
      { core: ["🎄", "🎁", "🎅", "❄️"], accents: ["🦌", "⛄", "🍪", "🥛"] },
      { core: ["🎃", "👻", "🕸️", "🕷️"], accents: ["🦇", "🍬", "🩸", "🌕"] },
      { core: ["🎆", "🥂", "🎉", "🎇"], accents: ["🍾", "🕛", "💃", "🥳"] }
    ]
  }
];

function shuffleStringArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateCombos() {
  const result = [];
  
  for (const theme of THEMES) {
    const combosList = [];
    
    for (const group of theme.groups) {
      // Create permutations of core + accents
      // Group them 3-6 items long.
      const pool = [...group.core, ...group.accents];
      
      // Force generating exactly 40-50 combos per group to hit ~1000
      // 8 themes * 2-3 groups = 21 groups. 21 * 50 = 1050 combos.
      for (let i = 0; i < 50; i++) {
        const length = Math.floor(Math.random() * 3) + 3; // 3 to 5
        const subset = shuffleStringArray(pool).slice(0, length);
        
        const comboString = subset.join("");
        
        combosList.push({
          id: `${theme.slug}-g${theme.groups.indexOf(group)}-${i}`,
          slug: `${theme.slug}-combo-${Date.now().toString(36)}-${i}`, // pseudo-unique
          emoji: comboString,
          name: `${theme.category} Vibe`,
          description: `A unique combination of emojis for ${theme.category.toLowerCase()} aesthetics.`,
          keywords: theme.keywords
        });
      }
    }

    result.push({
      id: theme.slug,
      name: theme.category,
      icon: theme.icon,
      combos: combosList
    });
  }

  return result;
}

async function main() {
  console.log("Generating Epic Combos...");
  const finalCombos = generateCombos();
  
  const outPath = path.join(__dirname, "..", "src", "data", "combos-data.json");
  fs.writeFileSync(outPath, JSON.stringify(finalCombos, null, 2), "utf-8");
  
  let totalCount = 0;
  finalCombos.forEach(c => totalCount += c.combos.length);
  
  console.log(`Successfully generated ${totalCount} Combos across ${THEMES.length} categories.`);
}

main();

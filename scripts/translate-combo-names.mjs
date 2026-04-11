import fs from 'fs';
import path from 'path';

const translations = {
  en: {
    "Aesthetic Vibe": "Aesthetic Vibe",
    "Nature & Cottagecore Vibe": "Nature & Cottagecore Vibe",
    "Space & Cyber Vibe": "Space & Cyber Vibe",
    "Food & Cafe Vibe": "Food & Cafe Vibe",
    "Love & Valentines Vibe": "Love & Valentines Vibe",
    "Animals & Pets Vibe": "Animals & Pets Vibe",
    "Fantasy & Magic Vibe": "Fantasy & Magic Vibe",
    "Holidays Vibe": "Holidays Vibe"
  },
  zh: {
    "Aesthetic Vibe": "唯美氛围",
    "Nature & Cottagecore Vibe": "自然与田园风",
    "Space & Cyber Vibe": "太空与赛博风",
    "Food & Cafe Vibe": "美食与咖啡店",
    "Love & Valentines Vibe": "爱与情人节",
    "Animals & Pets Vibe": "动物与宠物",
    "Fantasy & Magic Vibe": "奇幻与魔法",
    "Holidays Vibe": "节日氛围"
  },
  ja: {
    "Aesthetic Vibe": "美的雰囲気",
    "Nature & Cottagecore Vibe": "自然とコテージコア",
    "Space & Cyber Vibe": "宇宙とサイバー",
    "Food & Cafe Vibe": "食事とカフェ",
    "Love & Valentines Vibe": "愛とバレンタイン",
    "Animals & Pets Vibe": "動物とペット",
    "Fantasy & Magic Vibe": "ファンタジーと魔法",
    "Holidays Vibe": "休日の雰囲気"
  },
  ko: {
    "Aesthetic Vibe": "감성 분위기",
    "Nature & Cottagecore Vibe": "자연 & 코티지코어",
    "Space & Cyber Vibe": "우주 & 사이버펑크",
    "Food & Cafe Vibe": "음식 & 카페",
    "Love & Valentines Vibe": "사랑 & 발렌타인",
    "Animals & Pets Vibe": "동물 & 반려동물",
    "Fantasy & Magic Vibe": "판타지 & 마법",
    "Holidays Vibe": "명절 분위기"
  },
  es: {
    "Aesthetic Vibe": "Estilo Aesthetic",
    "Nature & Cottagecore Vibe": "Estilo Natural",
    "Space & Cyber Vibe": "Estilo Espacial y Cyber",
    "Food & Cafe Vibe": "Estilo Comida y Café",
    "Love & Valentines Vibe": "Estilo Amor y San Valentín",
    "Animals & Pets Vibe": "Estilo Animales y Mascotas",
    "Fantasy & Magic Vibe": "Estilo Fantasía y Magia",
    "Holidays Vibe": "Estilo Festivo"
  },
  ru: {
    "Aesthetic Vibe": "Эстетическая Атмосфера",
    "Nature & Cottagecore Vibe": "Природа и Коттеджкор",
    "Space & Cyber Vibe": "Космос и Киберпанк",
    "Food & Cafe Vibe": "Еда и Кафе",
    "Love & Valentines Vibe": "Любовь и День святого Валентина",
    "Animals & Pets Vibe": "Животные и Питомцы",
    "Fantasy & Magic Vibe": "Фэнтези и Магия",
    "Holidays Vibe": "Праздничная Атмосфера"
  }
};

const locales = ['en', 'zh', 'ja', 'ko', 'es', 'ru'];
const dir = '/Users/sgx/Desktop/Social/Dev/emojikit/src/i18n/dictionaries';

for (const locale of locales) {
  const filePath = path.join(dir, `${locale}.json`);
  let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  data.comboNames = translations[locale];
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${locale}.json`);
}


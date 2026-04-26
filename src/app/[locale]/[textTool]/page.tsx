import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FancyTextClient } from "../fancy-text/fancy-text-client";
import { getDictionary } from "@/i18n/dictionaries";
import { type Locale } from "@/i18n/config";
import { FAQSection } from "@/components/faq-section";
import { TextToolsTabs } from "../fancy-text/text-tools-tabs";

const TOOL_METADATA: Record<string, Record<string, { title: string, desc: string, h1: string, seoArticle?: { sections: { title: string, paragraphs: string[] }[] } }>> = {
  "glitch-text": {
    "en": { 
      title: "Glitch Text Generator — Cursed Zalgo Text", desc: "Generate glitch text, zalgo text, and creepy text to copy and paste.", h1: "Glitch Text Generator",
      seoArticle: {
        sections: [
          {
            title: "What is Glitch Text (Zalgo Text)?",
            paragraphs: [
              "Glitch text, also known as Zalgo text or cursed text, is a type of text modification that adds excessive combining diacritical marks (accents) above, below, and inside normal letters.",
              "This creates a chaotic, corrupted, or 'glitchy' visual effect that appears to spill over other lines of text, looking like a demonic hacking effect."
            ]
          },
          {
            title: "Where can I use Cursed Text?",
            paragraphs: [
              "Because glitch text is built using standard Unicode combining characters, you can copy and paste it into almost any modern platform.",
              "It is wildly popular in gaming communities, Reddit, Discord, and meme culture to signify horror, corruption, or to grab attention with a visually striking aesthetic. Just be careful, as too much Zalgo can break formatting on some older websites!"
            ]
          }
        ]
      }
    },
    "zh": { 
      title: "乱码文字生成器 (Glitch Text) — 故障风字符", desc: "生成乱码文字、故障风文字和恐怖的 Zalgo 字符，一键复制粘贴。", h1: "乱码文字生成器",
      seoArticle: {
        sections: [
          {
            title: "什么是乱码文字（Zalgo Text）？",
            paragraphs: [
              "乱码文字（通常被称为 Zalgo 文字、故障风或被诅咒的文字）是一种利用 Unicode 组合字符特性生成的视觉特效文本。",
              "它在常规字母的上方、中间和下方疯狂叠加各种注音符号或标记，从而营造出一种混乱、损坏、似乎要“溢出”屏幕的赛博朋克或克苏鲁恐怖感。"
            ]
          },
          {
            title: "哪里可以使用这些故障风乱码？",
            paragraphs: [
              "既然它本质上是由标准的 Unicode 字符拼接而成的，你就可以将它复制并粘贴到绝大多数现代社交平台上。",
              "这种文本在游戏社区、Discord、TikTok 评论区以及各种玩梗的地方都非常受欢迎，常用来制造令人不安的氛围或吸引眼球的视觉冲击力。"
            ]
          }
        ]
      }
    },
    "ja": {
      title: "グリッチテキストジェネレーター (Glitch Text) — 呪われた文字", desc: "グリッチテキスト、ザルゴテキスト（Zalgo）、不気味な文字を生成してコピー＆ペーストします。", h1: "グリッチテキストジェネレーター",
      seoArticle: {
        sections: [
          {
            title: "グリッチテキスト（Zalgoテキスト）とは？",
            paragraphs: ["グリッチテキスト（別名：ザルゴテキスト、呪われた文字）は、通常の文字の上下や内部に大量の結合分音記号（アクセント）を追加するテキスト装飾の一種です。", "これにより、混沌とした壊れたような視覚効果が生まれ、他の行のテキストにまで溢れ出すような悪魔的なハッキング効果を演出します。"]
          },
          {
            title: "呪われた文字はどこで使えますか？",
            paragraphs: ["グリッチテキストは標準的なUnicodeの結合文字を使用して構築されているため、コピーしてほぼすべての最新プラットフォームに貼り付けることができます。", "ゲームコミュニティ、Reddit、Discord、ミーム文化などで、ホラーや破損を表現したり、視覚的に目立つ美学で注目を集めるために大人気です。ただし、古いウェブサイトではフォーマットが崩れる可能性があるので注意してください！"]
          }
        ]
      }
    },
    "ko": {
      title: "글리치 텍스트 생성기 (Glitch Text) — 저주받은 문자", desc: "글리치 텍스트, 잘고 텍스트(Zalgo) 및 오싹한 문자를 생성하고 복사하여 붙여넣으세요.", h1: "글리치 텍스트 생성기",
      seoArticle: {
        sections: [
          {
            title: "글리치 텍스트(Zalgo 텍스트)란 무엇인가요?",
            paragraphs: ["글리치 텍스트(잘고 텍스트 또는 저주받은 문자라고도 함)는 일반 글자의 위, 아래, 내부에 과도한 결합 발음 구별 기호(악센트)를 추가하는 텍스트 수정 유형입니다.", "이로 인해 혼란스럽고 손상되거나 '글리치'가 발생한 듯한 시각적 효과가 나타나며, 다른 줄의 텍스트로 넘쳐흘러 악마적인 해킹 효과처럼 보입니다."]
          },
          {
            title: "저주받은 문자는 어디에 사용할 수 있나요?",
            paragraphs: ["글리치 텍스트는 표준 유니코드 결합 문자를 사용하여 만들어지므로 복사하여 거의 모든 최신 플랫폼에 붙여넣을 수 있습니다.", "게임 커뮤니티, Reddit, Discord 및 밈 문화에서 공포나 손상을 나타내거나 시각적으로 눈에 띄는 미학으로 관심을 끌기 위해 매우 인기가 있습니다. 하지만 너무 많은 Zalgo 문자는 일부 오래된 웹사이트의 서식을 깨뜨릴 수 있으니 주의하세요!"]
          }
        ]
      }
    },
    "es": {
      title: "Generador de Texto Glitch — Texto Maldito Zalgo", desc: "Genera texto glitch, texto zalgo y texto espeluznante para copiar y pegar.", h1: "Generador de Texto Glitch",
      seoArticle: {
        sections: [
          {
            title: "¿Qué es el Texto Glitch (Texto Zalgo)?",
            paragraphs: ["El texto glitch, también conocido como texto Zalgo o texto maldito, es un tipo de modificación de texto que añade marcas diacríticas (acentos) de combinación excesivas por encima, por debajo y dentro de las letras normales.", "Esto crea un efecto visual caótico, corrupto o de 'fallo' que parece derramarse sobre otras líneas de texto, pareciendo un efecto de hackeo demoníaco."]
          },
          {
            title: "¿Dónde puedo usar el Texto Maldito?",
            paragraphs: ["Debido a que el texto glitch se construye utilizando caracteres de combinación estándar de Unicode, puedes copiarlo y pegarlo en casi cualquier plataforma moderna.", "Es muy popular en las comunidades de juegos, Reddit, Discord y la cultura de los memes para significar horror, corrupción o para llamar la atención con una estética visualmente impactante. Solo ten cuidado, ya que demasiado Zalgo puede romper el formato en algunos sitios web más antiguos."]
          }
        ]
      }
    },
    "ru": {
      title: "Генератор Глитч Текста — Проклятый Текст Zalgo", desc: "Генерируйте глитч-текст, текст Zalgo и жуткий текст для копирования и вставки.", h1: "Генератор Глитч Текста",
      seoArticle: {
        sections: [
          {
            title: "Что такое глитч-текст (текст Zalgo)?",
            paragraphs: ["Глитч-текст, также известный как текст Zalgo или проклятый текст, — это тип модификации текста, при котором к обычным буквам добавляется чрезмерное количество комбинируемых диакритических знаков (акцентов) сверху, снизу и внутри.", "Это создает хаотичный, испорченный или «глючный» визуальный эффект, который, кажется, переливается на другие строки текста, напоминая демонический хакерский эффект."]
          },
          {
            title: "Где я могу использовать Проклятый Текст?",
            paragraphs: ["Поскольку глитч-текст создается с использованием стандартных комбинируемых символов Unicode, вы можете скопировать и вставить его практически на любую современную платформу.", "Он очень популярен в игровых сообществах, на Reddit, Discord и в мем-культуре для обозначения ужаса, искажения или для привлечения внимания с помощью поразительной эстетики. Просто будьте осторожны, так как слишком много Zalgo может нарушить форматирование на некоторых старых сайтах!"]
          }
        ]
      }
    }
  },
  "vaporwave-text": {
    "en": { 
      title: "Vaporwave Text Generator — Aesthetic Fonts", desc: "Generate aesthetic vaporwave text and fullwidth characters to copy and paste.", h1: "Vaporwave Text Generator",
      seoArticle: {
        sections: [
          {
            title: "What is Vaporwave Aesthetic Text?",
            paragraphs: [
              "Vaporwave text primarily uses a combination of 'fullwidth' characters. These characters were originally designed for Asian typography sets so that Latin letters would match the exact width of square Kanji characters.",
              "When used in English, it creates wide, evenly spaced-out typography. It has become a staple of the Vaporwave and Synthwave music and art aesthetics that emerged in the 2010s."
            ]
          },
          {
            title: "How to Use Aesthetic Text",
            paragraphs: [
              "Simply type your phrase into the generator and copy the ｖａｐｏｒｗａｖｅ result. The characters are Unicode, meaning they work without needing to install custom fonts.",
              "It is perfect for Tumblr blogs, YouTube lo-fi mix titles, Instagram aesthetics, and Twitter display names. It instantly gives your text a nostalgic, retro-futuristic 80s/90s internet vibe."
            ]
          }
        ]
      }
    },
    "zh": { 
      title: "蒸汽波文字生成器 (Vaporwave) — 全角唯美字符", desc: "生成蒸汽波风格文字、全角字符和伪西里尔字母，一键复制粘贴。", h1: "蒸汽波文字生成器",
      seoArticle: {
        sections: [
          {
            title: "什么是蒸汽波（Vaporwave）全角文字？",
            paragraphs: [
              "蒸汽波风格的文字主要利用了“全角字符（Fullwidth characters）”。这些字符最初是为了让英文字母在亚洲语境排版中，能与正方形的汉字占据相同的宽度而设计的。",
              "当我们在纯英文环境中使用它们时，就会呈现出一种宽大、间隔均匀的特殊排版效果。这种视觉风格深深绑定了 2010 年代兴起的蒸汽波和合成器浪潮（Synthwave）复古美学。"
            ]
          },
          {
            title: "唯美风文字的应用场景",
            paragraphs: [
              "只需在生成器中输入常规文字，就能立刻得到 ｖａｐｏｒｗａｖｅ 效果，直接复制即可使用。",
              "它非常适合用作 YouTube 上的 Lo-Fi 音乐标题、网易云音乐评论、Instagram 个性签名或者小红书标题。它可以瞬间让你的文字充满一种 80/90 年代复古互联网的怀旧氛围。"
            ]
          }
        ]
      }
    },
    "ja": {
      title: "Vaporwaveテキストジェネレーター — 美的な全角フォント", desc: "美的なVaporwaveテキストや全角文字を生成してコピー＆ペーストします。", h1: "Vaporwaveテキストジェネレーター",
      seoArticle: {
        sections: [
          {
            title: "Vaporwave（ヴェイパーウェイヴ）テキストとは？",
            paragraphs: ["Vaporwaveテキストは、主に「全角」文字の組み合わせを使用します。これらの文字は元々、ラテン文字が四角い漢字と全く同じ幅になるように、アジアのタイポグラフィセット用に設計されたものです。", "英語で使用すると、幅が広く均等に配置されたタイポグラフィが作成されます。これは、2010年代に登場したVaporwaveやSynthwave（シンセウェイヴ）の音楽やアート美学の定番となっています。"]
          },
          {
            title: "美的なテキストの使い方",
            paragraphs: ["ジェネレーターにフレーズを入力し、ｖａｐｏｒｗａｖｅな結果をコピーするだけです。文字はUnicodeなので、カスタムフォントをインストールしなくても機能します。", "Tumblrのブログ、YouTubeのローファイミックスのタイトル、Instagramの美学、Twitterの表示名に最適です。テキストに瞬時にノスタルジックでレトロフューチャーな80/90年代のインターネットの雰囲気を与えます。"]
          }
        ]
      }
    },
    "ko": {
      title: "Vaporwave 텍스트 생성기 — 미적 전각 폰트", desc: "미적 Vaporwave 텍스트와 전각 문자를 생성하고 복사하여 붙여넣으세요.", h1: "Vaporwave 텍스트 생성기",
      seoArticle: {
        sections: [
          {
            title: "Vaporwave(베이퍼웨이브) 텍스트란 무엇인가요?",
            paragraphs: ["Vaporwave 텍스트는 주로 '전각' 문자의 조합을 사용합니다. 이 문자는 원래 라틴 문자가 정사각형 한자와 정확히 같은 너비가 되도록 아시아 타이포그래피 세트용으로 설계되었습니다.", "영어에 사용하면 너비가 넓고 간격이 균일한 타이포그래피가 만들어집니다. 이는 2010년대에 등장한 Vaporwave 및 Synthwave 음악과 예술 미학의 필수 요소가 되었습니다."]
          },
          {
            title: "미적 텍스트 사용 방법",
            paragraphs: ["생성기에 문구를 입력하고 ｖａｐｏｒｗａｖｅ 결과를 복사하기만 하면 됩니다. 문자는 유니코드이므로 사용자 정의 폰트를 설치하지 않아도 작동합니다.", "Tumblr 블로그, YouTube 로파이 믹스 제목, Instagram 미학 및 Twitter 표시 이름에 적합합니다. 텍스트에 향수를 불러일으키는 레트로 퓨처리스틱 80/90년대 인터넷 분위기를 즉시 부여합니다."]
          }
        ]
      }
    },
    "es": {
      title: "Generador de Texto Vaporwave — Fuentes Estéticas", desc: "Genera texto vaporwave estético y caracteres de ancho completo para copiar y pegar.", h1: "Generador de Texto Vaporwave",
      seoArticle: {
        sections: [
          {
            title: "¿Qué es el Texto Estético Vaporwave?",
            paragraphs: ["El texto vaporwave utiliza principalmente una combinación de caracteres de 'ancho completo' (fullwidth). Estos caracteres fueron diseñados originalmente para conjuntos de tipografía asiática para que las letras latinas coincidieran con el ancho exacto de los caracteres Kanji cuadrados.", "Cuando se usa en inglés, crea una tipografía ancha y espaciada uniformemente. Se ha convertido en un elemento básico de la estética del arte y la música Vaporwave y Synthwave que surgió en la década de 2010."]
          },
          {
            title: "Cómo usar el Texto Estético",
            paragraphs: ["Simplemente escribe tu frase en el generador y copia el resultado ｖａｐｏｒｗａｖｅ. Los caracteres son Unicode, lo que significa que funcionan sin necesidad de instalar fuentes personalizadas.", "Es perfecto para blogs de Tumblr, títulos de mezclas lo-fi de YouTube, estética de Instagram y nombres de pantalla de Twitter. Instantáneamente le da a tu texto un ambiente nostálgico de Internet de los años 80 y 90 retrofuturista."]
          }
        ]
      }
    },
    "ru": {
      title: "Генератор Текста Vaporwave — Эстетичные Шрифты", desc: "Генерируйте эстетичный текст vaporwave и полноширинные символы для копирования и вставки.", h1: "Генератор Текста Vaporwave",
      seoArticle: {
        sections: [
          {
            title: "Что такое эстетичный текст Vaporwave?",
            paragraphs: ["Текст Vaporwave в основном использует комбинацию «полноширинных» (fullwidth) символов. Эти символы изначально были разработаны для азиатской типографики, чтобы латинские буквы соответствовали точной ширине квадратных иероглифов кандзи.", "При использовании в английском языке это создает широкую, равномерно распределенную типографику. Это стало основным элементом эстетики музыки и искусства Vaporwave и Synthwave, появившихся в 2010-х годах."]
          },
          {
            title: "Как использовать эстетичный текст",
            paragraphs: ["Просто введите свою фразу в генератор и скопируйте результат ｖａｐｏｒｗａｖｅ. Символы являются Unicode, что означает, что они работают без необходимости установки пользовательских шрифтов.", "Это идеально подходит для блогов Tumblr, заголовков lo-fi миксов на YouTube, эстетики Instagram и имен в Twitter. Это мгновенно придает вашему тексту ностальгическую, ретро-футуристическую атмосферу интернета 80/90-х годов."]
          }
        ]
      }
    }
  },
  "tiny-text": {
    "en": { 
      title: "Tiny Text Generator — Superscript Fonts", desc: "Convert normal text into tiny text, superscript, and subscript. Copy and paste.", h1: "Tiny Text Generator",
      seoArticle: {
        sections: [
          {
            title: "How does the Tiny Text Generator work?",
            paragraphs: [
              "Our Tiny Text Generator doesn't actually change your font size. Instead, it uses special Unicode characters that are naturally tiny. It converts your normal text into superscript, subscript, and small caps characters.",
              "Because these are not HTML tags or CSS styles but standard Unicode symbols, the tiny formatting stays intact even when you copy and paste it somewhere else."
            ]
          },
          {
            title: "What are Superscript and Subscript?",
            paragraphs: [
              "In typography, superscript characters (like ᵗʰⁱˢ) are set slightly above the normal line of type, while subscript characters (like ₜₕᵢₛ) are set slightly below.",
              "Originally used for mathematical exponents, trademark symbols, and chemical formulas, these tiny characters are now highly popular on social media to create a 'whispering' text effect, or to add subtle notes to your Discord and TikTok names."
            ]
          }
        ]
      }
    },
    "zh": { 
      title: "迷你文字生成器 (Tiny Text) — 上标/下标字体", desc: "将普通文本转换为迷你小写字母、上标和下标格式，一键复制粘贴。", h1: "迷你文字生成器",
      seoArticle: {
        sections: [
          {
            title: "迷你文字生成器是如何工作的？",
            paragraphs: [
              "我们的生成器并不是通过改变 HTML 字号来把字变小的。它利用了特殊的 Unicode 字符表，将你输入的常规字母替换为了天然就只有正常大小一半的“上标”、“下标”和“小型大写字母”。",
              "既然它们本身就是一种特殊的文字符号，这意味着你只要复制它们，无论粘贴到哪里（哪怕是不支持改变字体大小的平台），它们依然会保持迷你形态。"
            ]
          },
          {
            title: "上标与下标字符的妙用",
            paragraphs: [
              "在传统的排版系统中，上标（如 ᵗʰⁱˢ）通常写在标准文字的右上角，而下标（如 ₜₕᵢₛ）则位于右下角。它们曾经只被用于数学指数或是化学方程式（比如 H₂O）。",
              "但现在，网友们发现了它们的新玩法。在各大社交媒体、微信状态或游戏昵称中，使用这种迷你文字可以营造出一种“小声逼逼”、“悄悄话”或是极简高级的排版效果。"
            ]
          }
        ]
      }
    },
    "ja": {
      title: "ミニテキストジェネレーター — 上付き/下付きフォント", desc: "通常のテキストをミニテキスト、上付き文字、下付き文字に変換してコピー＆ペーストします。", h1: "ミニテキストジェネレーター",
      seoArticle: {
        sections: [
          {
            title: "ミニテキストジェネレーターの仕組みは？",
            paragraphs: ["当サイトのミニテキストジェネレーターは、実際にはフォントサイズを変更していません。代わりに、自然に小さい特殊なUnicode文字を使用しています。通常のテキストを上付き文字、下付き文字、スモールキャップス文字に変換します。", "これらはHTMLタグやCSSスタイルではなく、標準のUnicode記号であるため、別の場所にコピーして貼り付けても、小さなフォーマットはそのまま維持されます。"]
          },
          {
            title: "上付き文字と下付き文字とは？",
            paragraphs: ["タイポグラフィでは、上付き文字（ᵗʰⁱˢ など）は通常の文字の線よりわずかに上に配置され、下付き文字（ₜₕᵢₛ など）はわずかに下に配置されます。", "元々は数学の指数、商標記号、化学式に使用されていましたが、現在ではソーシャルメディアで「ささやき」テキスト効果を作成したり、DiscordやTikTokの名前に微妙なメモを追加したりするために大人気です。"]
          }
        ]
      }
    },
    "ko": {
      title: "작은 텍스트 생성기 — 위첨자/아래첨자 폰트", desc: "일반 텍스트를 작은 텍스트, 위첨자 및 아래첨자로 변환하고 복사하여 붙여넣으세요.", h1: "작은 텍스트 생성기",
      seoArticle: {
        sections: [
          {
            title: "작은 텍스트 생성기는 어떻게 작동하나요?",
            paragraphs: ["저희의 작은 텍스트 생성기는 실제로 폰트 크기를 변경하지 않습니다. 대신 자연스럽게 작은 특수 유니코드 문자를 사용합니다. 일반 텍스트를 위첨자, 아래첨자 및 작은 대문자로 변환합니다.", "이것은 HTML 태그나 CSS 스타일이 아니라 표준 유니코드 기호이기 때문에 다른 곳에 복사하여 붙여넣어도 작은 서식이 그대로 유지됩니다."]
          },
          {
            title: "위첨자와 아래첨자란 무엇인가요?",
            paragraphs: ["타이포그래피에서 위첨자(예: ᵗʰⁱˢ)는 일반 활자선보다 약간 위에 배치되고, 아래첨자(예: ₜₕᵢₛ)는 약간 아래에 배치됩니다.", "원래 수학의 지수, 상표 기호 및 화학식에 사용되었던 이 작은 문자는 이제 소셜 미디어에서 '속삭이는' 텍스트 효과를 만들거나 Discord 및 TikTok 이름에 미묘한 메모를 추가하는 데 매우 인기가 있습니다."]
          }
        ]
      }
    },
    "es": {
      title: "Generador de Texto Pequeño — Fuentes Superíndice", desc: "Convierte texto normal en texto pequeño, superíndice y subíndice. Copiar y pegar.", h1: "Generador de Texto Pequeño",
      seoArticle: {
        sections: [
          {
            title: "¿Cómo funciona el Generador de Texto Pequeño?",
            paragraphs: ["Nuestro generador de texto pequeño no cambia realmente el tamaño de la fuente. En su lugar, utiliza caracteres Unicode especiales que son naturalmente pequeños. Convierte tu texto normal en caracteres de superíndice, subíndice y versalitas.", "Debido a que no son etiquetas HTML o estilos CSS, sino símbolos estándar de Unicode, el formato pequeño permanece intacto incluso cuando lo copias y pegas en otro lugar."]
          },
          {
            title: "¿Qué son el Superíndice y Subíndice?",
            paragraphs: ["En tipografía, los caracteres en superíndice (como ᵗʰⁱˢ) se colocan ligeramente por encima de la línea normal de texto, mientras que los caracteres en subíndice (como ₜₕᵢₛ) se colocan ligeramente por debajo.", "Originalmente utilizados para exponentes matemáticos, símbolos de marcas comerciales y fórmulas químicas, estos pequeños caracteres son ahora muy populares en las redes sociales para crear un efecto de texto 'susurrante', o para agregar notas sutiles a tus nombres de Discord y TikTok."]
          }
        ]
      }
    },
    "ru": {
      title: "Генератор Крошечного Текста — Надстрочные Шрифты", desc: "Конвертируйте обычный текст в крошечный текст, надстрочный и подстрочный. Копировать и вставить.", h1: "Генератор Крошечного Текста",
      seoArticle: {
        sections: [
          {
            title: "Как работает генератор крошечного текста?",
            paragraphs: ["Наш генератор крошечного текста на самом деле не изменяет размер вашего шрифта. Вместо этого он использует специальные символы Unicode, которые от природы крошечные. Он преобразует ваш обычный текст в надстрочные, подстрочные и капительные символы.", "Поскольку это не HTML-теги или стили CSS, а стандартные символы Unicode, крошечное форматирование остается нетронутым даже при копировании и вставке в другое место."]
          },
          {
            title: "Что такое надстрочный и подстрочный индекс?",
            paragraphs: ["В типографике надстрочные символы (например, ᵗʰⁱˢ) располагаются немного выше обычной строки шрифта, а подстрочные символы (например, ₜₕᵢₛ) — немного ниже.", "Первоначально использовавшиеся для математических показателей степени, символов товарных знаков и химических формул, эти крошечные символы теперь очень популярны в социальных сетях для создания эффекта «шепчущего» текста или для добавления тонких заметок к вашим именам в Discord и TikTok."]
          }
        ]
      }
    }
  },
  "morse-code": {
    "en": { 
      title: "Morse Code Translator — Dots & Dashes", desc: "Translate text to Morse Code easily. Copy and paste the dots and dashes.", h1: "Morse Code Translator",
      seoArticle: {
        sections: [
          {
            title: "How to Translate Morse Code?",
            paragraphs: [
              "Our Morse Code Translator instantly converts standard Latin characters and numbers into international Morse Code. It maps each letter to its exact sequence of dots (.) and dashes (-).",
              "Invented in the 1830s for the telegraph, Morse code revolutionized long-distance communication. Today, while no longer used commercially, it remains a popular and cryptic way to send hidden messages."
            ]
          },
          {
            title: "Copy and Paste Morse Code",
            paragraphs: [
              "The generated dots and dashes are plain text characters, which makes them universally supported across the web.",
              "You can copy the generated Morse code and paste it into text messages, TikTok bios, Twitter updates, or use it for online puzzle solving, geocaching, and creating aesthetic cryptic statuses."
            ]
          }
        ]
      }
    },
    "zh": { 
      title: "摩斯密码翻译器 (Morse Code) — 转换与解密", desc: "将英文文本轻松转换为摩斯密码的点击声和破折号，一键复制粘贴。", h1: "摩斯密码翻译器",
      seoArticle: {
        sections: [
          {
            title: "如何翻译摩斯密码？",
            paragraphs: [
              "我们的摩斯密码翻译器能够将常规的英文字母和数字，瞬间转换为国际标准的摩斯密码格式。它严格遵循每字母对应的“滴 (点 .)”与“嗒 (划 -)”序列。",
              "摩斯密码发明于 1830 年代，曾在早期的电报与航海通信中发挥了不可替代的作用。如今虽然它已退出商业舞台，但依然是无数解谜游戏、密码爱好者和极客们最爱的一种加密表达方式。"
            ]
          },
          {
            title: "无缝复制与粘贴",
            paragraphs: [
              "生成器产出的点与破折号完全由标准文本字符构成，不受任何平台或设备的限制。",
              "你可以轻松将这些神秘的电码复制下来，粘贴到微信朋友圈、微博、小红书简介或是游戏公屏中，用来传递只有“懂的人才懂”的加密暗号或氛围感文案。"
            ]
          }
        ]
      }
    },
    "ja": {
      title: "モールス信号翻訳機 — ドットとダッシュの変換", desc: "テキストを簡単にモールス信号に翻訳します。ドットとダッシュをコピー＆ペーストしてください。", h1: "モールス信号翻訳機",
      seoArticle: {
        sections: [
          {
            title: "モールス信号の翻訳方法は？",
            paragraphs: ["当サイトのモールス信号翻訳機は、標準的なラテン文字と数字を即座に国際モールス信号に変換します。各文字を正確なドット（.）とダッシュ（-）のシーケンスにマッピングします。", "1830年代に電信のために発明されたモールス信号は、長距離通信に革命をもたらしました。現在では商業的には使用されていませんが、隠されたメッセージを送るための楽しくて謎めいた方法として人気があります。"]
          },
          {
            title: "モールス信号のコピーと貼り付け",
            paragraphs: ["生成されたドットとダッシュはプレーンテキスト文字であるため、ウェブ全体で普遍的にサポートされています。", "生成されたモールス信号をコピーして、テキストメッセージ、TikTokのプロフィール、Twitterのアップデートに貼り付けたり、オンラインのパズル解き、ジオキャッシング、美的な暗号ステータスの作成に使用したりできます。"]
          }
        ]
      }
    },
    "ko": {
      title: "모스 부호 번역기 — 점과 선 변환", desc: "텍스트를 모스 부호로 쉽게 번역하세요. 점과 선을 복사하여 붙여넣으세요.", h1: "모스 부호 번역기",
      seoArticle: {
        sections: [
          {
            title: "모스 부호 번역 방법",
            paragraphs: ["저희의 모스 부호 번역기는 표준 라틴 문자와 숫자를 즉시 국제 모스 부호로 변환합니다. 각 문자를 점(.)과 선(-)의 정확한 시퀀스에 매핑합니다.", "1830년대에 전신용으로 발명된 모스 부호는 장거리 통신에 혁명을 일으켰습니다. 오늘날에는 더 이상 상업적으로 사용되지 않지만 숨겨진 메시지를 보내는 재미있고 비밀스러운 방법으로 남아 있습니다."]
          },
          {
            title: "모스 부호 복사 및 붙여넣기",
            paragraphs: ["생성된 점과 선은 일반 텍스트 문자이므로 웹 전체에서 보편적으로 지원됩니다.", "생성된 모스 부호를 복사하여 문자 메시지, TikTok 약력, Twitter 업데이트에 붙여넣거나 온라인 퍼즐 풀기, 지오캐싱 및 미적 암호 상태 생성에 사용할 수 있습니다."]
          }
        ]
      }
    },
    "es": {
      title: "Traductor de Código Morse — Puntos y Rayas", desc: "Traduce texto a Código Morse fácilmente. Copia y pega los puntos y rayas.", h1: "Traductor de Código Morse",
      seoArticle: {
        sections: [
          {
            title: "¿Cómo traducir Código Morse?",
            paragraphs: ["Nuestro Traductor de Código Morse convierte instantáneamente caracteres latinos y números estándar en Código Morse internacional. Mapea cada letra a su secuencia exacta de puntos (.) y rayas (-).", "Inventado en la década de 1830 para el telégrafo, el código Morse revolucionó la comunicación a larga distancia. Hoy en día, aunque ya no se usa comercialmente, sigue siendo una forma divertida y críptica de enviar mensajes ocultos."]
          },
          {
            title: "Copiar y Pegar Código Morse",
            paragraphs: ["Los puntos y rayas generados son caracteres de texto sin formato, lo que los hace universalmente compatibles en toda la web.", "Puedes copiar el código Morse generado y pegarlo en mensajes de texto, biografías de TikTok, actualizaciones de Twitter, o usarlo para resolver acertijos en línea, geocaching y crear estados crípticos estéticos."]
          }
        ]
      }
    },
    "ru": {
      title: "Переводчик Азбуки Морзе — Точки и Тире", desc: "Легко переводите текст в азбуку Морзе. Скопируйте и вставьте точки и тире.", h1: "Переводчик Азбуки Морзе",
      seoArticle: {
        sections: [
          {
            title: "Как перевести азбуку Морзе?",
            paragraphs: ["Наш переводчик азбуки Морзе мгновенно преобразует стандартные латинские символы и цифры в международную азбуку Морзе. Он сопоставляет каждую букву с ее точной последовательностью точек (.) и тире (-).", "Изобретенная в 1830-х годах для телеграфа, азбука Морзе произвела революцию в связи на дальние расстояния. Сегодня, хотя она больше не используется в коммерческих целях, она остается популярным и загадочным способом отправки скрытых сообщений."]
          },
          {
            title: "Копирование и вставка азбуки Морзе",
            paragraphs: ["Сгенерированные точки и тире — это обычные текстовые символы, что делает их универсально поддерживаемыми в Интернете.", "Вы можете скопировать сгенерированную азбуку Морзе и вставить ее в текстовые сообщения, биографии TikTok, обновления Twitter или использовать ее для решения онлайн-головоломок, геокэшинга и создания эстетичных загадочных статусов."]
          }
        ]
      }
    }
  },
  'cursive-text': {
    'en': {
      title: 'Cursive Text Generator',
      desc: 'Convert normal text into beautiful cursive and script fonts.',
      h1: 'Cursive Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Cursive Text Generator?',
              paragraphs: [
                'Convert normal text into beautiful cursive and script fonts. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'zh': {
      title: '花体手写转换器',
      desc: '将普通文本转换为漂亮的手写体和草书字体。',
      h1: '花体手写转换器',
        seoArticle: {
          sections: [
            {
              title: '什么是 花体手写？',
              paragraphs: [
                '将普通文本转换为漂亮的手写体和草书字体。 我们的生成器利用 Unicode 标准，将您输入的普通字符转换成对应的特殊符号形式。',
                '这些符号可以直接复制粘贴到任何支持 Unicode 的平台，包括 Instagram, Twitter, Facebook, TikTok，甚至是游戏内的聊天框中。'
              ]
            },
            {
              title: '这是真正的字体(Font)吗？',
              paragraphs: [
                '不，这不是我们在电脑上安装的那种字体(Font)。本质上，它们是 Unicode 字符表中的特殊符号集。',
                '正因为它们是纯文本符号，您才可以自由地复制粘贴到各种社交媒体和网站上，而如果是真正的字体，对方设备上如果没有安装就无法显示。'
              ]
            }
          ]
        }
    },
    'ja': {
      title: 'Cursive Text Generator',
      desc: 'Convert normal text into beautiful cursive and script fonts.',
      h1: 'Cursive Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Cursive Text Generator?',
              paragraphs: [
                'Convert normal text into beautiful cursive and script fonts. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'ko': {
      title: 'Cursive Text Generator',
      desc: 'Convert normal text into beautiful cursive and script fonts.',
      h1: 'Cursive Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Cursive Text Generator?',
              paragraphs: [
                'Convert normal text into beautiful cursive and script fonts. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'es': {
      title: 'Cursive Text Generator',
      desc: 'Convert normal text into beautiful cursive and script fonts.',
      h1: 'Cursive Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Cursive Text Generator?',
              paragraphs: [
                'Convert normal text into beautiful cursive and script fonts. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'ru': {
      title: 'Cursive Text Generator',
      desc: 'Convert normal text into beautiful cursive and script fonts.',
      h1: 'Cursive Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Cursive Text Generator?',
              paragraphs: [
                'Convert normal text into beautiful cursive and script fonts. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
  },
  'old-english-text': {
    'en': {
      title: 'Old English Text Generator',
      desc: 'Generate gothic, fraktur, and old english text styles.',
      h1: 'Old English Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Old English Generator?',
              paragraphs: [
                'Generate gothic, fraktur, and old english text styles. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'zh': {
      title: '古英语字体生成器',
      desc: '生成哥特式、德文尖角体和古英语风格的文本。',
      h1: '古英语字体生成器',
        seoArticle: {
          sections: [
            {
              title: '什么是 古英语？',
              paragraphs: [
                '生成哥特式、德文尖角体和古英语风格的文本。 我们的生成器利用 Unicode 标准，将您输入的普通字符转换成对应的特殊符号形式。',
                '这些符号可以直接复制粘贴到任何支持 Unicode 的平台，包括 Instagram, Twitter, Facebook, TikTok，甚至是游戏内的聊天框中。'
              ]
            },
            {
              title: '这是真正的字体(Font)吗？',
              paragraphs: [
                '不，这不是我们在电脑上安装的那种字体(Font)。本质上，它们是 Unicode 字符表中的特殊符号集。',
                '正因为它们是纯文本符号，您才可以自由地复制粘贴到各种社交媒体和网站上，而如果是真正的字体，对方设备上如果没有安装就无法显示。'
              ]
            }
          ]
        }
    },
    'ja': {
      title: 'Old English Text Generator',
      desc: 'Generate gothic, fraktur, and old english text styles.',
      h1: 'Old English Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Old English Generator?',
              paragraphs: [
                'Generate gothic, fraktur, and old english text styles. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'ko': {
      title: 'Old English Text Generator',
      desc: 'Generate gothic, fraktur, and old english text styles.',
      h1: 'Old English Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Old English Generator?',
              paragraphs: [
                'Generate gothic, fraktur, and old english text styles. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'es': {
      title: 'Old English Text Generator',
      desc: 'Generate gothic, fraktur, and old english text styles.',
      h1: 'Old English Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Old English Generator?',
              paragraphs: [
                'Generate gothic, fraktur, and old english text styles. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'ru': {
      title: 'Old English Text Generator',
      desc: 'Generate gothic, fraktur, and old english text styles.',
      h1: 'Old English Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Old English Generator?',
              paragraphs: [
                'Generate gothic, fraktur, and old english text styles. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
  },
  'bold-text': {
    'en': {
      title: 'Bold Text Generator',
      desc: 'Make your text bold for Twitter, Facebook, and Instagram.',
      h1: 'Bold Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Bold Text Generator?',
              paragraphs: [
                'Make your text bold for Twitter, Facebook, and Instagram. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'zh': {
      title: '粗体文字生成器',
      desc: '生成可在社交媒体上使用的加粗文字。',
      h1: '粗体文字生成器',
        seoArticle: {
          sections: [
            {
              title: '什么是 粗体文字？',
              paragraphs: [
                '生成可在社交媒体上使用的加粗文字。 我们的生成器利用 Unicode 标准，将您输入的普通字符转换成对应的特殊符号形式。',
                '这些符号可以直接复制粘贴到任何支持 Unicode 的平台，包括 Instagram, Twitter, Facebook, TikTok，甚至是游戏内的聊天框中。'
              ]
            },
            {
              title: '这是真正的字体(Font)吗？',
              paragraphs: [
                '不，这不是我们在电脑上安装的那种字体(Font)。本质上，它们是 Unicode 字符表中的特殊符号集。',
                '正因为它们是纯文本符号，您才可以自由地复制粘贴到各种社交媒体和网站上，而如果是真正的字体，对方设备上如果没有安装就无法显示。'
              ]
            }
          ]
        }
    },
    'ja': {
      title: 'Bold Text Generator',
      desc: 'Make your text bold for Twitter, Facebook, and Instagram.',
      h1: 'Bold Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Bold Text Generator?',
              paragraphs: [
                'Make your text bold for Twitter, Facebook, and Instagram. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'ko': {
      title: 'Bold Text Generator',
      desc: 'Make your text bold for Twitter, Facebook, and Instagram.',
      h1: 'Bold Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Bold Text Generator?',
              paragraphs: [
                'Make your text bold for Twitter, Facebook, and Instagram. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'es': {
      title: 'Bold Text Generator',
      desc: 'Make your text bold for Twitter, Facebook, and Instagram.',
      h1: 'Bold Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Bold Text Generator?',
              paragraphs: [
                'Make your text bold for Twitter, Facebook, and Instagram. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'ru': {
      title: 'Bold Text Generator',
      desc: 'Make your text bold for Twitter, Facebook, and Instagram.',
      h1: 'Bold Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Bold Text Generator?',
              paragraphs: [
                'Make your text bold for Twitter, Facebook, and Instagram. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
  },
  'italic-text': {
    'en': {
      title: 'Italic Text Generator',
      desc: 'Slanted italic text generator for emphasis.',
      h1: 'Italic Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Italic Text Generator?',
              paragraphs: [
                'Slanted italic text generator for emphasis. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'zh': {
      title: '斜体文字生成器',
      desc: '生成倾斜的斜体文字以强调重点。',
      h1: '斜体文字生成器',
        seoArticle: {
          sections: [
            {
              title: '什么是 斜体文字？',
              paragraphs: [
                '生成倾斜的斜体文字以强调重点。 我们的生成器利用 Unicode 标准，将您输入的普通字符转换成对应的特殊符号形式。',
                '这些符号可以直接复制粘贴到任何支持 Unicode 的平台，包括 Instagram, Twitter, Facebook, TikTok，甚至是游戏内的聊天框中。'
              ]
            },
            {
              title: '这是真正的字体(Font)吗？',
              paragraphs: [
                '不，这不是我们在电脑上安装的那种字体(Font)。本质上，它们是 Unicode 字符表中的特殊符号集。',
                '正因为它们是纯文本符号，您才可以自由地复制粘贴到各种社交媒体和网站上，而如果是真正的字体，对方设备上如果没有安装就无法显示。'
              ]
            }
          ]
        }
    },
    'ja': {
      title: 'Italic Text Generator',
      desc: 'Slanted italic text generator for emphasis.',
      h1: 'Italic Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Italic Text Generator?',
              paragraphs: [
                'Slanted italic text generator for emphasis. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'ko': {
      title: 'Italic Text Generator',
      desc: 'Slanted italic text generator for emphasis.',
      h1: 'Italic Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Italic Text Generator?',
              paragraphs: [
                'Slanted italic text generator for emphasis. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'es': {
      title: 'Italic Text Generator',
      desc: 'Slanted italic text generator for emphasis.',
      h1: 'Italic Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Italic Text Generator?',
              paragraphs: [
                'Slanted italic text generator for emphasis. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'ru': {
      title: 'Italic Text Generator',
      desc: 'Slanted italic text generator for emphasis.',
      h1: 'Italic Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Italic Text Generator?',
              paragraphs: [
                'Slanted italic text generator for emphasis. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
  },
  'bubble-text': {
    'en': {
      title: 'Bubble Text Generator',
      desc: 'Enclose your text in cute bubbles and circles.',
      h1: 'Bubble Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Bubble Text Generator?',
              paragraphs: [
                'Enclose your text in cute bubbles and circles. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'zh': {
      title: '气泡文字生成器',
      desc: '将你的文字包裹在可爱的圆圈和气泡中。',
      h1: '气泡文字生成器',
        seoArticle: {
          sections: [
            {
              title: '什么是 气泡文字？',
              paragraphs: [
                '将你的文字包裹在可爱的圆圈和气泡中。 我们的生成器利用 Unicode 标准，将您输入的普通字符转换成对应的特殊符号形式。',
                '这些符号可以直接复制粘贴到任何支持 Unicode 的平台，包括 Instagram, Twitter, Facebook, TikTok，甚至是游戏内的聊天框中。'
              ]
            },
            {
              title: '这是真正的字体(Font)吗？',
              paragraphs: [
                '不，这不是我们在电脑上安装的那种字体(Font)。本质上，它们是 Unicode 字符表中的特殊符号集。',
                '正因为它们是纯文本符号，您才可以自由地复制粘贴到各种社交媒体和网站上，而如果是真正的字体，对方设备上如果没有安装就无法显示。'
              ]
            }
          ]
        }
    },
    'ja': {
      title: 'Bubble Text Generator',
      desc: 'Enclose your text in cute bubbles and circles.',
      h1: 'Bubble Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Bubble Text Generator?',
              paragraphs: [
                'Enclose your text in cute bubbles and circles. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'ko': {
      title: 'Bubble Text Generator',
      desc: 'Enclose your text in cute bubbles and circles.',
      h1: 'Bubble Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Bubble Text Generator?',
              paragraphs: [
                'Enclose your text in cute bubbles and circles. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'es': {
      title: 'Bubble Text Generator',
      desc: 'Enclose your text in cute bubbles and circles.',
      h1: 'Bubble Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Bubble Text Generator?',
              paragraphs: [
                'Enclose your text in cute bubbles and circles. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'ru': {
      title: 'Bubble Text Generator',
      desc: 'Enclose your text in cute bubbles and circles.',
      h1: 'Bubble Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Bubble Text Generator?',
              paragraphs: [
                'Enclose your text in cute bubbles and circles. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
  },
  'square-text': {
    'en': {
      title: 'Square Text Generator',
      desc: 'Wrap your text in square boxes.',
      h1: 'Square Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Square Text Generator?',
              paragraphs: [
                'Wrap your text in square boxes. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'zh': {
      title: '方块文字生成器',
      desc: '将你的文字包裹在方形边框中。',
      h1: '方块文字生成器',
        seoArticle: {
          sections: [
            {
              title: '什么是 方块文字？',
              paragraphs: [
                '将你的文字包裹在方形边框中。 我们的生成器利用 Unicode 标准，将您输入的普通字符转换成对应的特殊符号形式。',
                '这些符号可以直接复制粘贴到任何支持 Unicode 的平台，包括 Instagram, Twitter, Facebook, TikTok，甚至是游戏内的聊天框中。'
              ]
            },
            {
              title: '这是真正的字体(Font)吗？',
              paragraphs: [
                '不，这不是我们在电脑上安装的那种字体(Font)。本质上，它们是 Unicode 字符表中的特殊符号集。',
                '正因为它们是纯文本符号，您才可以自由地复制粘贴到各种社交媒体和网站上，而如果是真正的字体，对方设备上如果没有安装就无法显示。'
              ]
            }
          ]
        }
    },
    'ja': {
      title: 'Square Text Generator',
      desc: 'Wrap your text in square boxes.',
      h1: 'Square Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Square Text Generator?',
              paragraphs: [
                'Wrap your text in square boxes. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'ko': {
      title: 'Square Text Generator',
      desc: 'Wrap your text in square boxes.',
      h1: 'Square Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Square Text Generator?',
              paragraphs: [
                'Wrap your text in square boxes. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'es': {
      title: 'Square Text Generator',
      desc: 'Wrap your text in square boxes.',
      h1: 'Square Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Square Text Generator?',
              paragraphs: [
                'Wrap your text in square boxes. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'ru': {
      title: 'Square Text Generator',
      desc: 'Wrap your text in square boxes.',
      h1: 'Square Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Square Text Generator?',
              paragraphs: [
                'Wrap your text in square boxes. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
  },
  'upside-down-text': {
    'en': {
      title: 'Upside Down Text Generator',
      desc: 'Flip your text upside down instantly.',
      h1: 'Upside Down Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Upside Down Generator?',
              paragraphs: [
                'Flip your text upside down instantly. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'zh': {
      title: '倒立文字生成器',
      desc: '一键将你的文本完全倒转过来。',
      h1: '倒立文字生成器',
        seoArticle: {
          sections: [
            {
              title: '什么是 倒立文字？',
              paragraphs: [
                '一键将你的文本完全倒转过来。 我们的生成器利用 Unicode 标准，将您输入的普通字符转换成对应的特殊符号形式。',
                '这些符号可以直接复制粘贴到任何支持 Unicode 的平台，包括 Instagram, Twitter, Facebook, TikTok，甚至是游戏内的聊天框中。'
              ]
            },
            {
              title: '这是真正的字体(Font)吗？',
              paragraphs: [
                '不，这不是我们在电脑上安装的那种字体(Font)。本质上，它们是 Unicode 字符表中的特殊符号集。',
                '正因为它们是纯文本符号，您才可以自由地复制粘贴到各种社交媒体和网站上，而如果是真正的字体，对方设备上如果没有安装就无法显示。'
              ]
            }
          ]
        }
    },
    'ja': {
      title: 'Upside Down Text Generator',
      desc: 'Flip your text upside down instantly.',
      h1: 'Upside Down Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Upside Down Generator?',
              paragraphs: [
                'Flip your text upside down instantly. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'ko': {
      title: 'Upside Down Text Generator',
      desc: 'Flip your text upside down instantly.',
      h1: 'Upside Down Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Upside Down Generator?',
              paragraphs: [
                'Flip your text upside down instantly. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'es': {
      title: 'Upside Down Text Generator',
      desc: 'Flip your text upside down instantly.',
      h1: 'Upside Down Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Upside Down Generator?',
              paragraphs: [
                'Flip your text upside down instantly. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'ru': {
      title: 'Upside Down Text Generator',
      desc: 'Flip your text upside down instantly.',
      h1: 'Upside Down Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Upside Down Generator?',
              paragraphs: [
                'Flip your text upside down instantly. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
  },
  'strikethrough-text': {
    'en': {
      title: 'Strikethrough Text Generator',
      desc: 'Cross out text with strikethrough lines.',
      h1: 'Strikethrough Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Strikethrough Generator?',
              paragraphs: [
                'Cross out text with strikethrough lines. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'zh': {
      title: '删除线生成器',
      desc: '为你的文本添加中间划过的删除线。',
      h1: '删除线生成器',
        seoArticle: {
          sections: [
            {
              title: '什么是 删除线文字？',
              paragraphs: [
                '为你的文本添加中间划过的删除线。 我们的生成器利用 Unicode 标准，将您输入的普通字符转换成对应的特殊符号形式。',
                '这些符号可以直接复制粘贴到任何支持 Unicode 的平台，包括 Instagram, Twitter, Facebook, TikTok，甚至是游戏内的聊天框中。'
              ]
            },
            {
              title: '这是真正的字体(Font)吗？',
              paragraphs: [
                '不，这不是我们在电脑上安装的那种字体(Font)。本质上，它们是 Unicode 字符表中的特殊符号集。',
                '正因为它们是纯文本符号，您才可以自由地复制粘贴到各种社交媒体和网站上，而如果是真正的字体，对方设备上如果没有安装就无法显示。'
              ]
            }
          ]
        }
    },
    'ja': {
      title: 'Strikethrough Text Generator',
      desc: 'Cross out text with strikethrough lines.',
      h1: 'Strikethrough Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Strikethrough Generator?',
              paragraphs: [
                'Cross out text with strikethrough lines. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'ko': {
      title: 'Strikethrough Text Generator',
      desc: 'Cross out text with strikethrough lines.',
      h1: 'Strikethrough Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Strikethrough Generator?',
              paragraphs: [
                'Cross out text with strikethrough lines. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'es': {
      title: 'Strikethrough Text Generator',
      desc: 'Cross out text with strikethrough lines.',
      h1: 'Strikethrough Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Strikethrough Generator?',
              paragraphs: [
                'Cross out text with strikethrough lines. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'ru': {
      title: 'Strikethrough Text Generator',
      desc: 'Cross out text with strikethrough lines.',
      h1: 'Strikethrough Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Strikethrough Generator?',
              paragraphs: [
                'Cross out text with strikethrough lines. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
  },
  'leet-speak': {
    'en': {
      title: 'Leet Speak Generator',
      desc: 'Convert text to hacker 1337 speak.',
      h1: 'Leet Speak Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Leet Speak Generator?',
              paragraphs: [
                'Convert text to hacker 1337 speak. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'zh': {
      title: '黑客语(Leet)生成器',
      desc: '将普通文本转换为黑客专用的 1337 语言。',
      h1: '黑客语(Leet)生成器',
        seoArticle: {
          sections: [
            {
              title: '什么是 黑客语？',
              paragraphs: [
                '将普通文本转换为黑客专用的 1337 语言。 我们的生成器利用 Unicode 标准，将您输入的普通字符转换成对应的特殊符号形式。',
                '这些符号可以直接复制粘贴到任何支持 Unicode 的平台，包括 Instagram, Twitter, Facebook, TikTok，甚至是游戏内的聊天框中。'
              ]
            },
            {
              title: '这是真正的字体(Font)吗？',
              paragraphs: [
                '不，这不是我们在电脑上安装的那种字体(Font)。本质上，它们是 Unicode 字符表中的特殊符号集。',
                '正因为它们是纯文本符号，您才可以自由地复制粘贴到各种社交媒体和网站上，而如果是真正的字体，对方设备上如果没有安装就无法显示。'
              ]
            }
          ]
        }
    },
    'ja': {
      title: 'Leet Speak Generator',
      desc: 'Convert text to hacker 1337 speak.',
      h1: 'Leet Speak Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Leet Speak Generator?',
              paragraphs: [
                'Convert text to hacker 1337 speak. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'ko': {
      title: 'Leet Speak Generator',
      desc: 'Convert text to hacker 1337 speak.',
      h1: 'Leet Speak Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Leet Speak Generator?',
              paragraphs: [
                'Convert text to hacker 1337 speak. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'es': {
      title: 'Leet Speak Generator',
      desc: 'Convert text to hacker 1337 speak.',
      h1: 'Leet Speak Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Leet Speak Generator?',
              paragraphs: [
                'Convert text to hacker 1337 speak. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'ru': {
      title: 'Leet Speak Generator',
      desc: 'Convert text to hacker 1337 speak.',
      h1: 'Leet Speak Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Leet Speak Generator?',
              paragraphs: [
                'Convert text to hacker 1337 speak. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
  },
  'weird-text': {
    'en': {
      title: 'Weird Text Generator',
      desc: 'Generate strange, weird, and unusual text fonts.',
      h1: 'Weird Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Weird Text Generator?',
              paragraphs: [
                'Generate strange, weird, and unusual text fonts. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'zh': {
      title: '怪异文字生成器',
      desc: '生成各种奇怪、独特且不寻常的字体。',
      h1: '怪异文字生成器',
        seoArticle: {
          sections: [
            {
              title: '什么是 怪异文字？',
              paragraphs: [
                '生成各种奇怪、独特且不寻常的字体。 我们的生成器利用 Unicode 标准，将您输入的普通字符转换成对应的特殊符号形式。',
                '这些符号可以直接复制粘贴到任何支持 Unicode 的平台，包括 Instagram, Twitter, Facebook, TikTok，甚至是游戏内的聊天框中。'
              ]
            },
            {
              title: '这是真正的字体(Font)吗？',
              paragraphs: [
                '不，这不是我们在电脑上安装的那种字体(Font)。本质上，它们是 Unicode 字符表中的特殊符号集。',
                '正因为它们是纯文本符号，您才可以自由地复制粘贴到各种社交媒体和网站上，而如果是真正的字体，对方设备上如果没有安装就无法显示。'
              ]
            }
          ]
        }
    },
    'ja': {
      title: 'Weird Text Generator',
      desc: 'Generate strange, weird, and unusual text fonts.',
      h1: 'Weird Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Weird Text Generator?',
              paragraphs: [
                'Generate strange, weird, and unusual text fonts. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'ko': {
      title: 'Weird Text Generator',
      desc: 'Generate strange, weird, and unusual text fonts.',
      h1: 'Weird Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Weird Text Generator?',
              paragraphs: [
                'Generate strange, weird, and unusual text fonts. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'es': {
      title: 'Weird Text Generator',
      desc: 'Generate strange, weird, and unusual text fonts.',
      h1: 'Weird Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Weird Text Generator?',
              paragraphs: [
                'Generate strange, weird, and unusual text fonts. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
    'ru': {
      title: 'Weird Text Generator',
      desc: 'Generate strange, weird, and unusual text fonts.',
      h1: 'Weird Text Generator',
        seoArticle: {
          sections: [
            {
              title: 'What is the Weird Text Generator?',
              paragraphs: [
                'Generate strange, weird, and unusual text fonts. Our generator uses the Unicode standard to convert your standard keyboard input into these special character forms.',
                'These symbols can be copied and pasted directly into any platform that supports Unicode, including Instagram, Twitter, Facebook, TikTok, and even in-game chat boxes.'
              ]
            },
            {
              title: 'Are these actual fonts?',
              paragraphs: [
                'No, these are not actual fonts like the ones you install on your computer. They are essentially special symbols mapped out in the Unicode character table.',
                'Because they are plain text symbols, you can freely copy and paste them across various social media platforms and websites. If they were actual fonts, other people wouldn\'t be able to see them unless they had the exact same font installed on their device.'
              ]
            }
          ]
        }
    },
  },
};

export async function generateStaticParams() {
  const tools = ["glitch-text", "vaporwave-text", "tiny-text", "morse-code", "cursive-text", "old-english-text", "bold-text", "italic-text", "bubble-text", "square-text", "upside-down-text", "strikethrough-text", "leet-speak", "weird-text"];
  const locales = ["en", "zh", "ja", "ko", "es", "ru"];
  
  const params = [];
  for (const locale of locales) {
    for (const textTool of tools) {
      params.push({ locale, textTool });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string, textTool: string }>;
}): Promise<Metadata> {
  const { locale, textTool } = await params;
  if (!TOOL_METADATA[textTool]) return {};
  
  const meta = TOOL_METADATA[textTool]?.[locale] || TOOL_METADATA[textTool]?.["en"];
  return {
    title: meta?.title || "Text Tools",
    description: meta?.desc || "Convert and transform your text.",
  };
}

export default async function SpecificToolPage({
  params,
}: {
  params: Promise<{ locale: string, textTool: string }>;
}) {
  const { locale, textTool } = await params;
  if (!TOOL_METADATA[textTool]) return notFound();
  
  const dict = await getDictionary(locale as Locale);
  const meta = TOOL_METADATA[textTool]?.[locale] || TOOL_METADATA[textTool]?.["en"] || { title: textTool, desc: "Transform your text." };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <TextToolsTabs />
      
      <div className="space-y-4 text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          {meta.h1}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {meta.desc}
        </p>
      </div>

      <FancyTextClient toolMode={textTool} />
      
      {/* SEO Article section */}
      {meta.seoArticle && (
        <article className="mt-16 max-w-4xl mx-auto space-y-10 text-muted-foreground bg-muted/30 p-8 rounded-2xl border border-border/50">
          {meta.seoArticle.sections.map((section, index) => (
            <section key={index} className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">{section.title}</h2>
              <div className="space-y-4 text-base leading-relaxed">
                {section.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </article>
      )}
    </div>
  );
}

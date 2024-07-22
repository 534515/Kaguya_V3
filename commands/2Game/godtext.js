export default {
  name: "زخرفة2",
  author: "Kaguya Project",
  role: "member",
  cooldowns: 10,
  description: "زخرفة نصوص إنجليزي إلى حروف أشبه بالرموز!",
  async execute({ args }) {
    try {
      const [styleNumber, ...contentArgs] = args;
      const content = contentArgs.join(" ").toLowerCase();

      if (!content) {
        return kaguya.reply("[❗] | 1 = 🇭 🇪 🇱 🇱 🇴\n 2 = 𝒽𝑒𝓁𝓁𝑜 𝓌𝑜𝓇𝓁𝒹 \n3 = 𝐡𝐞𝐥𝐥𝐨 𝐰𝐨𝐫𝐥𝐝 \n4 = 𝒽𝑒𝓁𝓁𝑜 𝓌𝑜𝓇𝓁𝒹 \n5 = 𝕙𝕖𝕝𝕝𝕠 𝕨𝕠𝕣𝕝𝕕 \n6 = ⒽⒺⓁⓁⓄ ⓌⓄⓇⓁⒹ \nفقط استخدم زخرفة2 رقم النمط نص بالانجليزي مثال\nزخرفة2 | 2 | hello world");
      }

      const characterMaps = [
        // نمط 1 (الرموز الوطنية)
        {
          "🇭": "H", "🇪": "E", "🇱": "L", "🇲": "M", "🇮": "I", "🇲": "M",
          "🇼": "W", "🇯": "J", "🇳": "N", "🇦": "A", "🇧": "B", "🇨": "C",
          "🇩": "D", "🇪": "E", "🇫": "F", "🇬": "G", "🇭": "H", "🇮": "I",
          "🇯": "J", "🇰": "K", "🇱": "L", "🇲": "M", "🇳": "N", "🇴": "O",
          "🇵": "P", "🇶": "Q", "🇷": "R", "🇸": "S", "🇹": "T", "🇺": "U",
          "🇻": "V", "🇼": "W", "🇽": "X", "🇾": "Y", "🇿": "Z",
        },
        // نمط 2 (نمط "𝕒" - "𝕫")
        {
          "h": "𝗵", "e": "𝗲", "l": "𝗹", "o": "𝗼", "w": "𝘄", "r": "𝗿", "d": "𝗱",
        },
        // نمط 3 (نمط "Ⓐ" - "Ⓩ")
        {
          "h": "Ⓗ", "e": "Ⓔ", "l": "Ⓛ", "o": "Ⓞ", "w": "Ⓦ", "r": "Ⓡ", "d": "Ⓓ",
        },
        // نمط 4 (نمط "𝒶" - "𝓏")
        {
          "h": "𝒽", "e": "𝒺", "l": "𝓁", "o": "𝑜", "w": "𝓌", "r": "𝓇", "d": "𝒹",
        },
        // نمط 5 (نمط "𝕒" - "𝕫")
        {
          "h": "𝕙", "e": "𝕖", "l": "𝕝", "o": "𝕠", "w": "𝕨", "r": "𝕣", "d": "𝕕",
        },
        // نمط 6 (نمط "Ⓐ" - "Ⓩ")
        {
          "h": "🄷", "e": "🄴", "l": "🄻", "o": "🄾", "w": "🅂", "r": "🅁", "d": "🄳",
        }
      ];

      const selectedStyle = parseInt(styleNumber, 10) - 1;

      if (isNaN(selectedStyle) || selectedStyle < 0 || selectedStyle >= characterMaps.length) {
        return kaguya.reply("⚠️ | نمط غير صالح. الرجاء اختيار نمط صحيح من 1 إلى 6.");
      }

      const characterMap = characterMaps[selectedStyle];
      const convert = (text) => {
        return text.split('').map(char => characterMap[char] || char).join('');
      };

      const output = convert(content);
      return kaguya.reply(output);
    } catch (err) {
      console.error(err);
    }
  },
};

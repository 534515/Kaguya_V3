import fs from 'fs';
import axios from 'axios';
import path from 'path';

async function translateText(text) {
    try {
        const translationResponse = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=en&dt=t&q=${encodeURIComponent(text)}`);
        return translationResponse?.data?.[0]?.[0]?.[0];
    } catch (error) {
        console.error('Error in translation:', error);
        return text; // In case of error, return the original text
    }
}

async function generateSticker({ kaguya, event, args, api }) {
    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);
    try {
        const baseUrl = "https://kshitiz-t2i-fjfq.onrender.com/sdxl";
        let prompt = '';
        const model_id = 39;

        if (args.length > 0) {
            prompt = args.join(" ").trim();
            // Translate prompt from Arabic to English
            prompt = await translateText(prompt);
        } else {
            return kaguya.reply("❌ | قم بإدخال اسم شخصية");
        }

        const apiResponse = await axios.get(baseUrl, {
            params: {
                prompt: prompt,
                model_id: model_id
            }
        });

        if (apiResponse.data.imageUrl) {
            const imageUrl = apiResponse.data.imageUrl;
            const imagePath = path.join(process.cwd(), "cache", `sticker.png`);
            const imageResponse = await axios.get(imageUrl, { responseType: "stream" });
            const imageStream = imageResponse.data.pipe(fs.createWriteStream(imagePath));
            imageStream.on("finish", () => {
                const stream = fs.createReadStream(imagePath);
                kaguya.reply({
                    body: "",
                    attachment: stream
                });
            });
        } else {
            throw new Error("Image URL not found in response");
        }
    } catch (error) {
        console.error("Error:", error);
        message.reply("❌ | An error occurred. Please try again later.");
    }
}

export default {
    name: "استيكر",
    author: "kaguya project",
    description: "إنشاء ملصق باستخدام موجه نصي",
    role: "member",
    execute: generateSticker
};

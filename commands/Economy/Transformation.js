import axios from "axios";
import path from "path";
import fs from "fs";

export default {
    name: "المتجر",
    author: "حسين يعقوبي",
    role: "member",
    description: "يجلب معلومات حول تطبيق من متجر Google Play ويترجمها إلى اللغة العربية.",
    
    execute: async ({ api, event, args, global }) => {
        const { threadID, messageID } = event;
        
        api.setMessageReaction("🔍", messageID, (err) => {}, true);

        try {
            const searchTerm = args.join(" ");
            if (!searchTerm) {
                return api.sendMessage("يرجى تحديد اسم التطبيق.", threadID);
            }

            const apiUrl = `https://zcdsphapilist.replit.app/search?q=${encodeURIComponent(searchTerm)}`;
            const response = await axios.get(apiUrl);

            if (response.data && response.data.length > 0) {
                const app = response.data[0];
                const message = `࿇ ══━━━━✥◈✥━━━━══ ࿇\n📝 | اسم التطبيق: ${app.name}\n💼 | المطور: ${app.developer}\n🌟 | التقييم: ${app.rate2}\n📎 | رابط التطبيق: ${app.link}\n࿇ ══━━━━✥◈✥━━━━══ ࿇`;

                // Download image and send it as attachment
                const imagePath = path.join(process.cwd(), 'cache', 'play_store_app.jpg');
                const imageResponse = await axios.get(app.image, { responseType: 'stream' });
                const writer = fs.createWriteStream(imagePath);
                imageResponse.data.pipe(writer);

                writer.on('finish', () => {
                    api.sendMessage({
                        body: message,
                        attachment: fs.createReadStream(imagePath),
                    }, threadID, () => {
                        // Clean up the image file after sending the message
                        fs.unlinkSync(imagePath);
                    });
                });

                writer.on('error', (err) => {
                    console.error('Error writing image file:', err);
                    api.sendMessage("❌ | حدث خطأ أثناء تنزيل صورة التطبيق.", threadID);
                });

                api.setMessageReaction("✅", messageID, (err) => {}, true);
            } else {
                api.sendMessage("لم يتم العثور على نتائج للبحث.", threadID);
            }
        } catch (error) {
            console.error("Error fetching app info from Google Play:", error);
            api.sendMessage("حدث خطأ أثناء جلب معلومات التطبيق من المتجر.", threadID);
        }
    }
};

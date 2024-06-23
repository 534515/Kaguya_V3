import axios from "axios";
import path from "path";
import fs from "fs";

export default {
    name: "المتجر",
    author: "حسين يعقوبي",
    role: "member",
    description: "يجلب معلومات حول تطبيق من متجر Google Play ويترجمها إلى اللغة العربية.",
    
    execute: async ({ api, event, args, global }) => {
        const { threadID, senderID, messageID } = event;
        
        api.setMessageReaction("🔍", messageID, (err) => {}, true);

        try {
            const searchTerm = args.join(" ");
            if (!searchTerm) {
                return api.sendMessage("يرجى تحديد اسم التطبيق.", threadID);
            }

            const apiUrl = `https://zcdsphapilist.replit.app/search?q=${encodeURIComponent(searchTerm)}`;
            const response = await axios.get(apiUrl);

            if (response.data && response.data.length > 0) {
                let message = "📝 | اختر تطبيق من النتائج التالية عبر الرد برقم التطبيق:\n\n";
                
                response.data.slice(0, 5).forEach((app, index) => {
                    message += `${index + 1}. ${app.name} - المطور: ${app.developer} - التقييم: ${app.rate2}\n`;
                });

                api.sendMessage(message, threadID, (err, info) => {
                    global.client.handler.reply.set(info.messageID, {
                        author: senderID,
                        type: "pick",
                        name: "المتجر",
                        unsend: true,
                        data: response.data.slice(0, 5)
                    });
                });

                api.setMessageReaction("✅", messageID, (err) => {}, true);
            } else {
                api.sendMessage("لم يتم العثور على نتائج للبحث.", threadID);
            }
        } catch (error) {
            console.error("Error fetching app info from Google Play:", error);
            api.sendMessage("حدث خطأ أثناء جلب معلومات التطبيق من المتجر.", threadID);
        }
    },

    onReply: async ({ api, event, reply }) => {
        const { senderID, messageID, threadID, body } = event;
        
        if (reply.type === "pick" && reply.name === "المتجر" && reply.author === senderID) {
            const selectedIndex = parseInt(body, 10) - 1;
            if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= reply.data.length) {
                return api.sendMessage("❌ | الاختيار غير صالح، حاول مرة أخرى.", threadID);
            }

            const selectedApp = reply.data[selectedIndex];
            const message = `࿇ ══━━━━✥◈✥━━━━══ ࿇\n📝 | اسم التطبيق: ${selectedApp.name}\n💼 | المطور: ${selectedApp.developer}\n🌟 | التقييم: ${selectedApp.rate2}\n📎 | رابط التطبيق: ${selectedApp.link}\n࿇ ══━━━━✥◈✥━━━━══ ࿇`;

            api.sendMessage(message, threadID);

            // Download image and send it as attachment
            const imagePath = path.join(process.cwd(), 'cache', 'play_store_app.jpg');
            const imageResponse = await axios.get(selectedApp.image, { responseType: 'stream' });
            imageResponse.data.pipe(fs.createWriteStream(imagePath));

            setTimeout(() => {
                api.sendMessage({
                    attachment: fs.createReadStream(imagePath),
                }, threadID);
            }, 2000);

            api.setMessageReaction("✅", messageID, (err) => {}, true);
        }
    }
};
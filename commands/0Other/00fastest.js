import fs from "fs";
import axios from "axios";
import path from "path";

const tempImageFilePath = process.cwd() + "/cache/tempImage.jpg";
const userDataFile = path.join(process.cwd(), 'pontsData.json');

// Ensure the existence of the user data file
if (!fs.existsSync(userDataFile)) {
    fs.writeFileSync(userDataFile, '{}');
}

export default {
    name: "الاسرع",
    author: "حسين يعقوبي",
    role: "member",
    description: "احزر الإيموجي من الصورة",
    execute: async function ({ api, event, Economy }) {
        try {
            const emojis = [
                { emoji: "😗", link: "https://i.imgur.com/LdyIyYD.png" },
                { emoji: "😭", link: "https://i.imgur.com/P8zpqby.png" },
                { emoji: "🤠", link: "https://i.imgur.com/kG71glL.png" },
                { emoji: "🙂", link: "https://i.imgur.com/hzP1Zca.png" },
                { emoji: "🐸", link: "https://i.imgur.com/rnsgJju.png" },
                { emoji: "⛽", link: "https://i.imgur.com/LBROa0K.png" },
                { emoji: "💰", link: "https://i.imgur.com/uQmrlvt.png" },
                { emoji: "🥅", link: "https://i.imgur.com/sGItXyC.png" },
                { emoji: "♋", link: "https://i.imgur.com/FCOgj6D.jpg" },
                { emoji: "🍌", link: "https://i.imgur.com/71WozFU.jpg" },
                { emoji: "🦊", link: "https://i.imgur.com/uyElK2K.png" },
                { emoji: "😺", link: "https://i.imgur.com/PXjjXzl.png" },
                { emoji: "🍀", link: "https://i.imgur.com/8zJRvzg.png" },
                { emoji: "🆘", link: "https://i.imgur.com/Sl0JWTu.png" },
                { emoji: "🥺", link: "https://i.imgur.com/M69t6MP.jpg" },
                { emoji: "😶", link: "https://i.imgur.com/k0hHyyX.jpg" },
                { emoji: "😑", link: "https://i.imgur.com/AvZygtY.png" },
                { emoji: "😔", link: "https://i.imgur.com/pQ08T2Q.jpg" },
                { emoji: "🤦‍♂️", link: "https://i.imgur.com/WbVCMIp.jpg" },
                { emoji: "👀", link: "https://i.imgur.com/sH3gFGd.jpg" },
                { emoji: "💱", link: "https://i.imgur.com/Gt301sv.jpg" },
                { emoji: "🕴️", link: "https://i.imgur.com/652pmot.jpg" },
                { emoji: "🏖️", link: "https://i.imgur.com/CCb2cVz.png" },
                { emoji: "🏕️", link: "https://i.imgur.com/zoGHqWD.jpg" },
                { emoji: "🪆", link: "https://i.imgur.com/FUrUIYZ.jpg" }
                // Add more emoji-image pairs here
            ];

            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

            const imageResponse = await axios.get(randomEmoji.link, { responseType: "arraybuffer" });
            fs.writeFileSync(tempImageFilePath, Buffer.from(imageResponse.data, "binary"));

            const attachment = [fs.createReadStream(tempImageFilePath)];
            const message = `▱▱▱▱▱▱▱▱▱▱▱▱▱\n\tمن يرسل الإيموجي الأول يفز:\n▱▱▱▱▱▱▱▱▱▱▱▱▱`;

            api.sendMessage({ body: message, attachment }, event.threadID, async (error, info) => {
                if (!error) {
                    try {
                        await Economy.getBalance(event.senderID); // Check user's economy info
                        client.handler.reply.set(info.messageID, {
                            author: event.senderID,
                            type: "reply",
                            name: "الاسرع",
                            correctEmoji: randomEmoji.emoji, // Add the correct emoji
                            unsend: true
                        });
                    } catch (e) {
                        console.error("Error checking user's economy info:", e);
                    }
                } else {
                    console.error("Error sending message:", error);
                }
            });
        } catch (error) {
            console.error("Error executing the game:", error);
            api.sendMessage(`An error occurred while executing the game. Please try again.`, event.threadID);
        }
    },
    onReply: async function ({ api, event, reply, Economy }) {
        if (reply && reply.type === "reply" && reply.name === "الاسرع") {
            const userEmoji = event.body.trim();
            const correctEmoji = reply.correctEmoji;

            if (userEmoji === correctEmoji) {
                try {
                    // Handle winning action here, like increasing points
                    
                        const pointsData = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
                        const userPoints = pointsData[event.senderID] || { name: userName, points: 0 }; // تحقق من وجود بيانات المستخدم، وإذا لم يكن موجودًا، قم بإنشاء بيانات جديدة
                        userPoints.points += 50; // زيادة عدد النقاط
                        pointsData[event.senderID] = userPoints; // تحديث بيانات المستخدم في الكائن
                        fs.writeFileSync(userDataFile, JSON.stringify(pointsData, null, 2));

                    api.sendMessage(`✅ | تهانينا يا ${userName} ! أنت كنت الأسرع وحصلت بذالك على 50 نقطة.`, event.threadID);
                    api.unsendMessage(reply.messageID);
                    api.setMessageReaction("✅", event.messageID, (err) => {}, true);
                    
                } catch (e) {
                    console.error("Error handling winning action:", e);
                }
            } else {
                api.sendMessage(`❌ | آسفة هذا ليس الإيموحي الصحيح `, event.threadID);

                api.setMessageReaction("❌", event.messageID, (err) => {}, true);
                
            }
        }
        fs.unlinkSync(tempImageFilePath);
    }
};
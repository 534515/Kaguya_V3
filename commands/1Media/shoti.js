import axios from "axios";
import request from "request";
import fs from "fs";

export default {
  name: "تحميل",
  author: "kaguya project",
  role: "member",
  description: "تنزيل مقاطع الفيديو من تيك توك أو يوتيوب بناءً على الوصف.",

  execute: async ({ api, event, args, Economy }) => {
    api.setMessageReaction("⬇️", event.messageID, (err) => {}, true);

    const userMoney = (await Economy.getBalance(event.senderID)).data;
    const cost = 500;
    if (userMoney < cost) {
      return api.sendMessage(`⚠️ | لا يوجد لديك رصيد كافٍ. يجب عليك الحصول على ${cost} دولار أولاً من أجل تنزيل مقطع واحد. يمكنك تنزيل مقاطع من تيك توك، فيسبوك، بنتريست، يوتيوب، انستغرام.`, event.threadID);
    }

    // الخصم من الرصيد
    await Economy.decrease(cost, event.senderID);

    try {
      const description = args.join(" ");
      if (!description) {
        api.sendMessage(
          "[!] يجب تقديم وصف الفيديو للمتابعة.",
          event.threadID,
          event.messageID
        );
        return;
      }

      // Fetch user data to get the user's name
      const userInfo = await api.getUserInfo(event.senderID);
      const senderName = userInfo[event.senderID].name;

      // Send initial message
      const sentMessage = await api.sendMessage(
        `🕟 | مرحبًا @${senderName}، جارٍ تنزيل الفيديو، الرجاء الانتظار...`,
        event.threadID
      );

      // تحديد نوع الرابط (يوتيوب أو تيك توك)
      const isYouTube = description.includes("youtube.com") || description.includes("youtu.be");
      const isTikTok = description.includes("tiktok.com");

      const apiUrl = isYouTube
        ? `https://king-aryanapis.onrender.com/api/ytdl?url=${encodeURIComponent(description)}`
        : isTikTok
        ? `https://king-aryanapis.onrender.com/api/ttdl?url=${encodeURIComponent(description)}`
        : null;

      if (!apiUrl) {
        api.sendMessage("⚠️ | الرابط غير مدعوم. يرجى تقديم رابط يوتيوب أو تيك توك.", event.threadID);
        return;
      }

      const response = await axios.get(apiUrl);
      const videoData = response.data.result;

      if (!videoData || !videoData.video) {
        api.sendMessage("⚠️ | لم أتمكن من العثور على فيديو بناءً على الوصف المقدم. يرجى المحاولة مرة أخرى.", event.threadID);
        return;
      }

      const videoUrl = videoData.video;
      const filePath = `${process.cwd()}/cache/video.mp4`;

      // تأكد من أن الرابط صالح بالتحقق من استجابة HTTP
      request.head(videoUrl, (err, res) => {
        if (err || res.statusCode !== 200) {
          api.sendMessage("⚠️ | الرابط الذي تم الحصول عليه غير صالح أو الفيديو غير متاح.", event.threadID);
          return;
        }

        // قم بتنزيل الفيديو وإرساله من المسار المؤقت
        const videoStream = request(videoUrl).pipe(fs.createWriteStream(filePath));
        videoStream.on("close", () => {
          api.unsendMessage(sentMessage.messageID); // حذف الرسالة التي تم التفاعل معها ب "⬇️"
          api.setMessageReaction("✅", event.messageID, (err) => {}, true);

          const messageBody = `╼╾─────⊹⊱⊰⊹─────╼╾\n✅ | تم تحميل الفيديو\n╼╾─────⊹⊱⊰⊹─────╼╾`;

          api.sendMessage(
            {
              body: messageBody,
              attachment: fs.createReadStream(filePath),
            },
            event.threadID,
            () => fs.unlinkSync(filePath) // حذف الملف بعد الإرسال
          );
        });
      });
    } catch (error) {
      console.error(error);
      api.sendMessage("⚠️ | حدث خطأ أثناء تنزيل الفيديو. يرجى المحاولة مرة أخرى.", event.threadID);
    }
  },
};

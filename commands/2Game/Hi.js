import fs from "fs";
import path from "path";
import axios from "axios";

export default {
  name: "قولي",
  author: "Thiệu Trung Kiên",
  role: "member",
  description: "تحويل النص إلى كلام بواسطة خدمة Google Text-to-Speech.",
  execute: async ({ api, message, args, event }) => {
    let say = args.join(" ");

    if (!say) {
      return api.sendMessage("يرجى تقديم نص للتحويل إلى كلام.", event.threadID);
    }

    try {
      const url = `https://nobs-api.onrender.com/dipto/text2voiceV2?text=${encodeURIComponent(say)}&format=mp3&voiceModel=Nova`;
      const response = await axios.get(url);
      const audioUrl = response.data.voiceUrl;

      const audioResponse = await axios.get(audioUrl, { responseType: "arraybuffer" });

      const audioPath = path.join(process.cwd(), "cache", "audio.mp3");
      fs.writeFileSync(audioPath, Buffer.from(audioResponse.data));

      await api.sendMessage({
        body: "",
        attachment: fs.createReadStream(audioPath)
      }, event.threadID);

      // إزالة الملف المؤقت بعد إرساله
      fs.unlinkSync(audioPath);
    } catch (error) {
      console.error(error);
      await api.sendMessage("🐸 حدث خطأ أثناء تحويل النص إلى كلام.", event.threadID);
    }
  }
};

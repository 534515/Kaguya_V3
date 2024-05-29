import axios from "axios";
import fs from "fs-extra";
import path from "path";

export default {
  name: "تطقيم",
  author: "Kaguya Project 1",
  description: "جلب صورة لزوجين أنمي",
  role: "member",
  execute: async ({ api, event, Economy }) => {
    try {

const userMoney = (await Economy.getBalance(event.senderID)).data;
      const cost = 500;
      if (userMoney < cost) {
        return api.sendMessage(`🔖 | سيكلفك ذالك ${cost} دولار للتطقيم الواحد`, event.threadID);
      }

      // الخصم من الرصيد
      await Economy.decrease(cost, event.senderID)
      
      // جلب البيانات من الرابط المعطى
      const response = await axios.get("https://api.erdwpe.com/api/randomgambar/couplepp");

      // التحقق من وجود البيانات المطلوبة
      if (!response.data.status || !response.data.result || !response.data.result.male || !response.data.result.female) {
        throw new Error("لا توجد بيانات صالحة للصور");
      }

      // جلب روابط الصور
      const imageUrl1 = response.data.result.male;
      const imageUrl2 = response.data.result.female;

      // تحميل الصور
      const image1Response = await axios.get(imageUrl1, { responseType: "arraybuffer" });
      const image2Response = await axios.get(imageUrl2, { responseType: "arraybuffer" });

      // حفظ الصور مؤقتًا
      const path1 = path.join(process.cwd(), "cache", "anime_pair_1.jpg");
      const path2 = path.join(process.cwd(), "cache", "anime_pair_2.jpg");
      fs.writeFileSync(path1, Buffer.from(image1Response.data, "binary"));
      fs.writeFileSync(path2, Buffer.from(image2Response.data, "binary"));

      // إرسال الصور إلى المستخدم
      await api.sendMessage(
        {
          body: '✿━━━━━━━━━━━━━━━━━✿\n\t\t「 إليك التطقيم الخاص بك ✨ 」\n✿━━━━━━━━━━━━━━━━━✿',
          attachment: [
            fs.createReadStream(path1),
            fs.createReadStream(path2)
          ],
        },
        event.threadID
      );
    } catch (error) {
      console.error(error);
      api.sendMessage("حدث خطأ أثناء جلب الصور.", event.threadID);
    }
  },
};
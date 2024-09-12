import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
  name: "مثير",
  author: "ChatGPT",
  role: "member",
  description: "صور مثيرة للفتيات في الأنمي.",
  async execute({ api, event, Economy }) {

    // إضافة رد الفعل المبدئي 🚫
    api.setMessageReaction("🚫", event.messageID, (err) => {}, true);

    const userMoney = (await Economy.getBalance(event.senderID)).data;
    const cost = 10000;
    if (userMoney < cost) {
      return api.sendMessage(`⚠️ | على وين يا حلو 🙂 إدفع ${cost} علشان تشوف الصور 😉`, event.threadID);
    }

    // الخصم من الرصيد
    await Economy.decrease(cost, event.senderID);

    try {
      const response = await axios.get('https://ahegao.netlify.app/random');
      const ext = response.headers['content-type'].split('/')[1];
      
      // استخدام process.cwd() بدلاً من __dirname
      const tempFilePath = path.join(process.cwd(), 'cache', `hintai.${ext}`);

      const writer = fs.createWriteStream(tempFilePath);
      axios({
        method: 'get',
        url: response.request.res.responseUrl,
        responseType: 'stream',
      }).then(response => {
        response.data.pipe(writer);
        writer.on('finish', () => {

          // إصلاح استدعاء api.setMessageReaction
          api.setMessageReaction("😏", event.messageID, (err) => {}, true);
          
          // إرسال الصورة
          api.sendMessage(
            {
              attachment: fs.createReadStream(tempFilePath)
            },
            event.threadID,
            () => fs.unlinkSync(tempFilePath),
            event.messageID
          );
        });
      });
    } catch (error) {
      console.error("Error fetching Siesta image:", error.message);
      api.sendMessage("🚧 | حدث خطأ أثناء جلب الصورة. يرجى المحاولة مرة أخرى.", event.threadID, event.messageID);
    }
  }
};

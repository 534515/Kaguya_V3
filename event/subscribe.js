import { log } from "../logger/index.js";
import fs from "fs";

export default {
  name: "subscribe",
  execute: async ({ api, event, Threads, Users }) => {
    var threads = (await Threads.find(event.threadID))?.data?.data || {};
    if (!threads) {
      await Threads.create(event.threadID);
    }
    switch (event.logMessageType) {
      case "log:unsubscribe":
        {
          if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) {
            await Threads.remove(event.threadID);
            return log([
              {
                message: "[ THREADS ]: ",
                color: "yellow",
              },
              {
                message: ` ❌ | المجموعة مع المعرف : ${event.threadID} قامت بطرد البوت خارجا `,
                color: "green",
              },
            ]);
          }
          await Threads.update(event.threadID, {
            members: +threads.members - 1,
          });
          break;
        }
      case "log:subscribe": {
        if (event.logMessageData.addedParticipants.some((i) => i.userFbId == api.getCurrentUserID())) {
          // حذف رسالة توصيل كاغويا
          api.unsendMessage(event.messageID);

          // تغيير كنية البوت تلقائيا عند الإضافة إلى المجموعة
          const botName = "كاغويا"; // اسم البوت يدويا
          api.changeNickname(
            `》 《 ❃ ➠ ${botName}`,
            event.threadID,
            api.getCurrentUserID()
          );

          // تزيين رسالة الدخول
          const welcomeMessage = `┌───── ～✿～ ─────┐\n
✅ | تــم الــتــوصــيــل بـنـجـاح
❏ الـرمـز : 『بدون رمز』
❏ إسـم الـبـوت : 『${botName}』
❏ الـمـطـور : 『حــســيــن يــعــقــوبــي』
❏ رابـط الـمـطـور : https://www.facebook.com/profile.php?id=100076269693499 \n╼╾─────⊹⊱⊰⊹─────╼╾\n⚠️  | اكتب قائمة او اوامر \n╼╾─────⊹⊱⊰⊹─────╼╾\n🔖 | اكتب ضيفيني من اجل ان تدخل مجموعة البوت او تقرير \n╼╾─────⊹⊱⊰⊹─────╼╾\n〘🎀 KᗩGᑌYᗩ ᗷOT 🎀〙\n└───── ～✿～ ─────┘
`;

          // إرسال رسالة الدخول
          const videoPath = "cache12/welcome.mp4";
          api.sendMessage(
            {
              body: welcomeMessage,
              attachment: fs.createReadStream(videoPath),
            },
            event.threadID
          );
        } else {
          for (let i of event.logMessageData.addedParticipants) {
            await Users.create(i.userFbId);
          }
          await Threads.update(event.threadID, {
            members: +threads.members + +event.logMessageData.addedParticipants.length,
          });
        }
      }
    }
  },
};

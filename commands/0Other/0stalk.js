import jimp from 'jimp';
import fs from 'fs';
import path from 'path';

async function getProfilePicture(userID) {
    const url = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const img = await jimp.read(url);
    const profilePath = path.join(process.cwd(), 'cache', `profile_${userID}.png`);
    await img.writeAsync(profilePath);
    return profilePath;
}

async function getUserMessageCount(api, threadId, userId) {
  try {
    const messages = await api.getThreadHistory(threadId, 10000);
    if (!messages || !Array.isArray(messages)) {
      console.error('Error fetching messages:', messages);
      return 0;
    }

    let messageCount = 0;
    messages.forEach(message => {
      if (message.senderID === userId) {
        messageCount++;
      }
    });

    return messageCount;
  } catch (err) {
    console.error('Error:', err);
    return 0;
  }
}

export default {
  name: "ايدي",
  author: "Kaguya Project",
  role: "member",
  description: "جلب معلومات العضو.",
  execute: async function({ api, event, args, Economy }) {
    try {
      const uid = event?.messageReply?.senderID || (Object.keys(event.mentions).length > 0 ? Object.keys(event.mentions)[0] : event.senderID);
      const userInfo = await api.getUserInfo(parseInt(uid));
      
      if (!userInfo[uid]) {
        api.sendMessage(`⚠️ | قم بعمل منشن للشخص ما.`, event.threadID, event.messageID);
        return;
      }
      
      const { firstName, name, gender, profileUrl } = userInfo[uid];
      const userIsFriend = userInfo[uid].isFriend ? "✅ نعم" : "❌ لا";
      const isBirthdayToday = userInfo[uid].isBirthdayToday ? "✅ نعم" : "❌ لا";
      const profilePath = await getProfilePicture(uid);

      // استخدام Economy.getBalance لجلب الرصيد
      const balanceResult = await Economy.getBalance(uid);
      const money = balanceResult.data; // افتراض أن البيانات تُرجع بصيغة { data: amount }
      const userDataFile = path.join(process.cwd(), 'pontsData.json');

      const userData = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
      const userPoints = userData[event.senderID]?.points || 0; 

      // جلب عدد الرسائل المرسلة من قبل المستخدم
      const userMessageCount = await getUserMessageCount(api, event.threadID, uid);

      // تصنيف المستخدم باستخدام عدد الرسائل
      const rank = getRank(userMessageCount);

      const message = `
•——[معلومات]——•\n\n✨ مــﻋــڷــﯡمــاٺ ؏ــن : 『${firstName}』\n❏اسمك👤: 『${name}』\n❏جنسك♋: 『${gender === 1 ? "أنثى" : "ذكر"}』\n❏💰 رصيدك : 『${money}』 دولار\n❏🎖️ نقاطك : 『${userPoints}』 نقطة\n❏📩 عدد الرسائل : 『${userMessageCount}』\n❏صديق؟: 『${userIsFriend}』\n❏عيد ميلاد اليوم؟: 『${isBirthdayToday}』\n❏🌟 المعرف  : 『${uid}』\n❏رابط البروفايل🔮: ${profileUrl}\n❏تصنيفك🧿: 『${rank}』\n🔖 | العب الالعاب من أجل ان تكسب نقاط تجعلك في القمة\n`;

      api.sendMessage({
        body: message,
        attachment: fs.createReadStream(profilePath)
      }, event.threadID, event.messageID);

    } catch (err) {
      console.error('Error:', err);
      api.sendMessage('❌ | حدث خطأ أثناء جلب المعلومات. الرجاء معاودة المحاولة في وقت لاحق.', event.threadID, event.messageID);
    }
  }
}

// دالة لتحديد تصنيف المستخدم بناءً على عدد الرسائل
function getRank(messageCount) {
  if (messageCount >= 10000) return 'خارق🥇';
  if (messageCount >= 7000) return '🥈عظيم';
  if (messageCount >= 6000) return '👑أسطوري';
  if (messageCount >= 5000) return 'نشط🔥 قوي';
  if (messageCount >= 4000) return '🌠نشط';
  if (messageCount >= 3000) return 'متفاعل🏅 قوي';
  if (messageCount >= 2000) return '🎖️متفاعل جيد';
  if (messageCount >= 1000) return '🌟متفاعل';
  if (messageCount >= 800) return '✨لا بأس';
  if (messageCount >= 600) return '👾مبتدأ';
  if (messageCount >= 300) return '🗿صنم';
  return 'ميت⚰️';
}

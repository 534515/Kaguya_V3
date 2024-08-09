import jimp from 'jimp';
import fs from 'fs';
import path from 'path';

async function getProfilePicture(userID) {
  const url = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
  try {
    const img = await jimp.read(url);
    const profilePath = `profile_${userID}.png`;
    await img.writeAsync(profilePath);
    return profilePath;
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    throw error;
  }
}

async function getUserMessageCount(api, threadId, userId) {
  try {
    // جلب تاريخ المحادثة
    const messages = await api.getThreadHistory(threadId, 10000);
    if (!messages || !Array.isArray(messages)) {
      console.error('Error fetching messages: No messages found or response is not an array');
      return 0;
    }

    // حساب عدد الرسائل التي أرسلها المستخدم المحدد
    const messageCount = messages.reduce((count, message) => {
      if (message && message.senderID === userId) {
        count++;
      }
      return count;
    }, 0);

    return messageCount;
  } catch (error) {
    console.error('Error fetching message count:', error.message);
    return 0;
  }
}

export default {
  name: "معلوماتي",
  author: "Kaguya Project",
  role: "member",
  description: "جلب معلومات العضو.",
  aliases: ["ايدي"],
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
      const money = balanceResult.data;

      const userDataFile = path.join(process.cwd(), 'pontsData.json');
      const userData = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
      const userPoints = userData[event.senderID]?.points || 0;

      // جلب عدد الرسائل للمستخدم
      const userMessageCount = await getUserMessageCount(api, event.threadID, uid);

      // تصنيف المستخدم باستخدام عدد الرسائل
      const rank = getRank(userMessageCount);

      const message = `
 ❛ ━━━━━･❪ 🕊️ ❫ ･━━━━━ ❜\n\t\t
•——[معلومات]——•\n\n✨ مــﻋــڷــﯡمــاٺ ؏ــن : 『${firstName}』\n❏اسمك👤: 『${name}』\n❏جنسك♋: 『${gender === 1 ? "أنثى" : "ذكر"}』\n❏💰 رصيدك : 『${money}』 دولار\n❏🎖️ نقاطك : 『${userPoints}』 نقطة\n❏📩 عدد الرسائل : 『${userMessageCount}』\n❏صديق؟: 『${userIsFriend}』\n❏🌟 المعرف  : 『${uid}』\n❏رابط البروفايل🔮: ${profileUrl}\n❏تصنيفك🧿: 『${rank}』\n
 ❛ ━━━━━･❪ 🕊️ ❫ ･━━━━━ ❜`;

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
function getRank(userMessageCount) {
  if (userMessageCount >= 3000) return 'خارق🥇';
  if (userMessageCount >= 2000) return '🥈عظيم';
  if (userMessageCount >= 1000) return '👑أسطوري';
  if (userMessageCount >= 500) return 'نشط🔥 قوي';
  if (userMessageCount >= 400) return '🌠نشط';
  if (userMessageCount >= 300) return 'متفاعل🏅 قوي';
  if (userMessageCount >= 200) return '🎖️متفاعل جيد';
  if (userMessageCount >= 100) return '🌟متفاعل';
  if (userMessageCount >= 50) return '✨لا بأس';
  if (userMessageCount >= 10) return '👾مبتدأ';
  if (userMessageCount >= 5) return '🗿صنم';
  return 'ميت⚰️';
}

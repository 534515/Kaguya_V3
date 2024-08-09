import jimp from 'jimp';
import fs from 'fs';
import path from 'path';
// افترض أن هذا هو ملف exp الذي يحتوي على وظائف check

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

async function getUserInfo(api, uid) {
  const userInfo = await api.getUserInfo(parseInt(uid));
  return userInfo[uid];
}

async function getUserPoints(userID) {
  const userDataFile = path.join(process.cwd(), 'pontsData.json');
  const userData = JSON.parse(fs.readFileSync(userDataFile, 'utf8'));
  return userData[userID]?.points || 0;
}

async function getExpInfo(uid) {
  const expInfo = await exp.check(uid);
  if (expInfo.status) {
    return expInfo.data;
  }
  return { currentLevel: 0, exp: 0, expNeededForNextLevel: 0 };
}

export default {
  name: "معلوماتي",
  author: "Kaguya Project",
  role: "member",
  description: "جلب معلومات العضو.",
  aliases: ["ايدي"],
  execute: async function({ api, event, args, Economy, exp }) {
    try {
      const uid = event?.messageReply?.senderID || (Object.keys(event.mentions).length > 0 ? Object.keys(event.mentions)[0] : event.senderID);
      const userInfo = await getUserInfo(api, uid);
      if (!userInfo) {
        api.sendMessage(`⚠️ | قم بعمل منشن للشخص ما.`, event.threadID, event.messageID);
        return;
      }
      const { firstName, name, gender, profileUrl } = userInfo;
      const userIsFriend = userInfo.isFriend ? "✅ نعم" : "❌ لا";
      const isBirthdayToday = userInfo.isBirthdayToday ? "✅ نعم" : "❌ لا";
      const profilePath = await getProfilePicture(uid);

      // استخدام Economy.getBalance لجلب الرصيد
      const balanceResult = await Economy.getBalance(uid);
      const money = balanceResult.data;

      // جلب نقاط الخبرة
      const expInfo = await getExpInfo(uid);
      const { currentLevel, exp, expNeededForNextLevel } = expInfo;

      // جلب النقاط من ملف البيانات
      const userPoints = await getUserPoints(event.senderID);

      // تصنيف المستخدم باستخدام نقاط الخبرة
      const rank = getRank(exp);

      const message = `
 ❛ ━━━━━･❪ 🕊️ ❫ ･━━━━━ ❜\n\t\t
•——[معلومات]——•\n\n✨ مــﻋــڷــﯡمــاٺ ؏ــن : 『${firstName}』\n❏اسمك👤: 『${name}』\n❏جنسك♋: 『${gender === 1 ? "أنثى" : "ذكر"}』\n❏💰 رصيدك : 『${money}』 دولار\n❏🎖️ نقاطك : 『${userPoints}』 نقطة\n❏📩 نقاط الخبرة : 『${exp} / ${expNeededForNextLevel}』\n❏صديق؟: 『${userIsFriend}』\n❏🌟 المعرف  : 『${uid}』\n❏رابط البروفايل🔮: ${profileUrl}\n❏تصنيفك🧿: 『${rank}』\n
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

// دالة لتحديد تصنيف المستخدم بناءً على نقاط الخبرة
function getRank(exp) {
  if (exp >= 3000) return 'خارق🥇';
  if (exp >= 2000) return '🥈عظيم';
  if (exp >= 1000) return '👑أسطوري';
  if (exp >= 500) return 'نشط🔥 قوي';
  if (exp >= 400) return '🌠نشط';
  if (exp >= 300) return 'متفاعل🏅 قوي';
  if (exp >= 200) return '🎖️متفاعل جيد';
  if (exp >= 100) return '🌟متفاعل';
  if (exp >= 50) return '✨لا بأس';
  if (exp >= 10) return '👾مبتدأ';
  if (exp >= 5) return '🗿صنم';
  return 'ميت⚰️';
}

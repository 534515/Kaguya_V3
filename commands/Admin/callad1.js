import moment from 'moment-timezone';

export default {
  name: "تقرير",
  version: "1.0.0",
  author: "kaguya project",
  description: "إرسال تقرير إلى المطور",
  role: "member",
  cooldowns: 5,
  execute: async ({ api, event, args }) => {
    const message = args.join(' ').trim();
    if (message.length === 0) {
      return api.sendMessage('⚠️ | أرجوك قم بإدخال رسالة لإرسالها إلى المطور.', event.threadID, event.messageID);
    }

    const senderID = event.senderID.split(':')[0];
    const userInfo = await api.getUserInfo(senderID);
    const senderName = userInfo && userInfo[senderID] ? userInfo[senderID].name : `@${senderID}`;

    const timezone = 'Africa/Casablanca';
    const date = moment().tz(timezone).format('MM/DD/YY');
    const time = moment().tz(timezone).format('h:mm:ss A');

    const developerMessage = `◆❯━━━━━▣✦▣━━━━━━━❮◆\n🧾 | لديك رسالة ، سينسي\n من طرف @${senderName}\n\n${message}\n\⏰ | الوقت : ${time} (${timezone})\n📅 | التاريخ : ${date}\n◆❯━━━━━▣✦▣━━━━━━━❮◆`;
    const developerThreadID = '100076269693499';

    try {
      await api.sendMessage({
        body: developerMessage,
        mentions: [{
          tag: `@${senderName}`,
          id: senderID,
        }],
      }, developerThreadID);

api.setMessageReaction("✅", event.messageID, (err) => {}, true);

      await api.sendMessage('✅ | تم إرسال رسالتك إلى المطور بنجاح', event.threadID, event.messageID);
    } catch (error) {
      console.error('Error sending message to developer:', error);
      return api.sendMessage('❌ | حدث خطأ. الرجاء معاودة المحاولة في وقت لاحق.', event.threadID, event.messageID);
    }
  }
};
  

import path from 'path';
import fs from 'fs';

async function getGreetingImage() {
  // تحديد المسار إلى مجلد 'ara.mp3'
  const imagePath = path.join(process.cwd(), 'cache12', 'ara.mp3'); // تحديث اسم الصورة إذا كان مختلفًا
  return fs.createReadStream(imagePath);
}

export default {
  name: "ارارار",
  author: "البوت",
  role: "member",
   aliases:["اررر","ارارارا"],
  description: "يرسل رسالة ترحيبية مع صورة.",
  execute: async function({ api, event }) {
    try {
      const greetingImageStream = await getGreetingImage();
       
       api.setMessageReaction("🤭", event.messageID, (err) => {}, true);
  
      api.sendMessage({
        body: "✧───────────────✧\n\t\t\t\tlove you 💖\n✧───────────────✧",
        attachment: greetingImageStream
      }, event.threadID, event.messageID);
    } catch (error) {
      console.error('Error sending greeting message:', error);
      api.sendMessage('❌ | حدث خطأ أثناء إرسال الرسالة الترحيبية.', event.threadID, event.messageID);
    }
  }
};

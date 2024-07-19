import axios from "axios";
import fs from "fs";
import { Innertube, UniversalCache } from 'youtubei.js';

export default {
  name: "يوتيوب",
  author: "Kaguya Project",
  description: "يجلب مقاطع من اليوتيوب بواسطة كلمة البحث",
  role: "member",
  execute: async ({ args, api, event }) => {
    const songTitle = args.join(" ");
    const searchUrl = `https://markdevs69-1efde24ed4ea.herokuapp.com/search/youtube?q=${encodeURIComponent(songTitle)}`;

    try {
      // البحث عن الفيديو باستخدام الرابط الخارجي
      const response = await axios.get(searchUrl);
      const searchResults = response.data.results;

      if (!searchResults || searchResults.length === 0) {
        api.sendMessage("⚠️ | لم يتم العثور على المقطع!", event.threadID, event.messageID);
        return;
      }

      // الحصول على أول نتيجة
      const video = searchResults[0];
      const videoId = video.id.videoId;
      const videoTitle = video.snippet.title;

      api.sendMessage(`🔍 | جاري البحث عن الفيديو : ${videoTitle}\n ⏱️ |يرجى الانتظار......`, event.threadID, event.messageID);

      // إعداد مكتبة Innertube
      const yt = await Innertube.create({ cache: new UniversalCache(false), generate_session_locally: true });

      // تحميل الفيديو
      const stream = await yt.download(videoId, {
        type: 'video+audio', // audio, video or video+audio
        quality: 'best', // best, bestefficiency, 144p, 240p, 480p, 720p and so on.
        format: 'mp4' // media container format 
      });

      const file = fs.createWriteStream(`./temp/video.mp4`);

      async function writeToStream(stream) {
        const startTime = Date.now();
        let bytesDownloaded = 0;

        for await (const chunk of stream) {
          await new Promise((resolve, reject) => {
            file.write(chunk, (error) => {
              if (error) {
                reject(error);
              } else {
                bytesDownloaded += chunk.length;
                resolve();
              }
            });
          });
        }

        const endTime = Date.now();
        const downloadTimeInSeconds = (endTime - startTime) / 1000;
        const downloadSpeedInMbps = (bytesDownloaded / downloadTimeInSeconds) / (1024 * 1024);

        return new Promise((resolve, reject) => {
          file.end((error) => {
            if (error) {
              reject(error);
            } else {
              resolve({ downloadTimeInSeconds, downloadSpeedInMbps });
            }
          });
        });
      }

      async function main() {
        const { downloadTimeInSeconds, downloadSpeedInMbps } = await writeToStream(stream);
        const fileSizeInMB = file.bytesWritten / (1024 * 1024);

        const messageBody = `حجم الفيديو ⚙️: ${fileSizeInMB.toFixed(2)} ميجابايت\nسرعة التحميل 💹: ${downloadSpeedInMbps.toFixed(2)} ميغابايت في الثانية\nمدة التحميل ⏰: ${downloadTimeInSeconds.toFixed(2)} ثانية`;

        const titleMessage = ` ✅ | تم تحميل الفيديو بنجاح\nعنوان الفيديو 📋 : ${videoTitle}\n`;
        api.sendMessage({
          body: `${titleMessage}${messageBody}`,
          attachment: fs.createReadStream(`./temp/video.mp4`)
        }, event.threadID, event.messageID);
      }

      main();
    } catch (error) {
      console.error(error);
      api.sendMessage("❌ | حدث خطأ أثناء جلب الفيديو من اليوتيوب. الرجاء المحاولة مرة أخرى لاحقًا.", event.threadID);
    }
  }
};

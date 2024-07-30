import axios from 'axios';
import fs from 'fs';
import path from 'path';

export default {
  name: "شوتي",
  author: "ArYAN",
  role: "member",
  description: "Fetches and sends a Shoti video based on the provided API.",

  execute: async ({ api, event }) => {
    const videoPath = path.join(process.cwd(), 'cache', 'shoti.mp4');
    const apiUrl = 'https://c-v1.onrender.com/shoti?apikey=$c-v1-7bejgsue6@iygv';

    // Send initial message to indicate fetching
    const sentMessage = await api.sendMessage("⏱️ | جاري الحصول على مقطع شوتي يرجى الانتظار....", event.threadID, event.messageID);

    try {
      // Fetch data from the API
      const response = await axios.get(apiUrl);
      const { data } = response;

      if (data && data.code === 200 && data.data) {
        const { url: videoURL, title, duration, user } = data.data;
        const { username: userName, nickname: userNickname, userID } = user;

        // Download the video
        const videoResponse = await axios.get(videoURL, { responseType: 'stream' });
        const writer = fs.createWriteStream(videoPath);

        videoResponse.data.pipe(writer);

        writer.on('finish', () => {
          api.unsendMessage(sentMessage.messageID); // Remove the initial message

          const messageToSend = {
            body: `🎀 𝗦𝗵𝗼𝘁𝗶\n❍───────────────❍\n📝 | العنوان: ${title}\n👑 | إسم المستخدم: ${userName}\n🎯 | اللقب: ${userNickname}\n⏳ | المدة: ${duration}\n🆔 | معرف المستخدم: ${userID}\n❍───────────────❍`,
            attachment: fs.createReadStream(videoPath)
          };

          api.sendMessage(messageToSend, event.threadID, (err) => {
            if (err) {
              console.error("Error sending video:", err);
              api.sendMessage("An error occurred while sending the video.", event.threadID, event.messageID);
            }

            fs.unlink(videoPath, (err) => {
              if (err) console.error("Error deleting video file:", err);
            });
          });

          // Indicate successful completion
          api.setMessageReaction("✅", event.messageID, (err) => {}, true);
        });

        writer.on('error', (err) => {
          console.error("Error downloading video:", err);
          api.sendMessage("An error occurred while downloading the video.", event.threadID, event.messageID);
        });
      } else {
        api.sendMessage("Failed to fetch the video. Invalid response from the API.", event.threadID, event.messageID);
      }
    } catch (error) {
      console.error("Error fetching video from API:", error);
      api.sendMessage("An error occurred while fetching the video.", event.threadID, event.messageID);
    }
  }
};

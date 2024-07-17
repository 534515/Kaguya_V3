import fs from "fs";
import path from "path";
import DIG from "discord-image-generation";
import axios from "axios";

export default {
  name: "ألوان",
  version: "1.2",
  author: "Samir Œ",
  role: "member",
  description: "Randomly selects a user from the group and generates a 'gay' image for fun.",
  execute: async ({ api, event }) => {
    const participantIDs = event.participantIDs;
    const randomUserID = getRandomUserID(participantIDs);

    try {
      api.getUserInfo(randomUserID, async (err, userInfo) => {
        if (err) {
          console.error("Error fetching user info:", err.message);
          return api.sendMessage("An error occurred while fetching user info.", event.threadID, event.messageID);
        }

        const avatarURL = userInfo[randomUserID].thumbSrc;
        const userName = userInfo[randomUserID].name;

        const img = await new DIG.Gay().getImage(avatarURL);
        const pathSave = path.join(process.cwd(), "tmp", `${randomUserID}_gay.png`);
        fs.writeFileSync(pathSave, Buffer.from(img));

        api.sendMessage({
          body: `لقد تم إيجاد أن العضو المسمى ب ${userName} على أنه 💯 ألوان 👇`,
          attachment: fs.createReadStream(pathSave)
        }, event.threadID, () => {
          fs.unlinkSync(pathSave);
        }, event.messageID);
      });
    } catch (error) {
      console.error("Error generating image:", error.message);
      api.sendMessage("An error occurred while generating the image.", event.threadID, event.messageID);
    }
  }
};

function getRandomUserID(participantIDs) {
  const filteredIDs = participantIDs.filter(id => id !== "100060340563670" && id !== "100082247235177" && id !== "100047481257472" && id !== "61552229885334");
  return filteredIDs[Math.floor(Math.random() * filteredIDs.length)];
            }

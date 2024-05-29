import axios from 'axios';
import fs from 'fs';
import path from 'path';

class Help {
  constructor() {
    this.name = "اوامر";
    this.author = "Kaguya Project";
    this.cooldowns = 60;
    this.description = "عرض قائمة الأوامر مع كيفية استعمال كل واحد!";
    this.role = "member";
    this.aliases = ["أوامر"];
    this.commands = global.client.commands;
    this.cache = {}; // Cache to store image paths
    this.tempFolder = path.join(process.cwd(), 'temp');
    this.randomImageUrls = [
      "https://i.imgur.com/mCpWvaI.jpeg",
      "https://i.imgur.com/Q8Ljscl.jpeg",
      "https://i.imgur.com/ZGfBNLX.jpeg",
      "https://i.imgur.com/UV1zAwh.jpeg",
      "https://i.imgur.com/MKoNjNT.jpeg",
      "https://i.imgur.com/ICzZ9l6.jpeg",
      "https://i.imgur.com/wdWjH1D.jpeg",
      "https://i.imgur.com/H2rhsH5.jpeg",
      "https://i.imgur.com/GE7w5nt.jpeg",
      "https://i.imgur.com/UEg87Rw.png",
      "https://i.imgur.com/q9myIow.jpeg",
      "https://i.imgur.com/k1Bhji6.jpeg",
      "https://i.imgur.com/6DT6OrG.jpeg",
      "https://i.imgur.com/dRMPS2V.jpeg"
    ];
  }

  async execute({ api, event, args }) {

api.setMessageReaction("📝", event.messageID, (err) => {}, true);
    
    
    const [pageStr] = args;
    const page = parseInt(pageStr) || 1;
    const commandsPerPage = 8; // تعديل عدد الأوامر في كل صفحة
    const startIndex = (page - 1) * commandsPerPage;
    const endIndex = page * commandsPerPage;

    const commandList = Array.from(this.commands.values());
    const totalPages = Math.ceil(commandList.length / commandsPerPage);
    const totalCommands = commandList.length;

    if (pageStr && typeof pageStr === 'string' && pageStr.toLowerCase() === 'الكل') {
      let allCommandsMsg = "╭───────────────◊\n•——[قِـٰٚـِْ✮ِـٰٚـِْآئمِـٰٚـِْ✮ِـٰٚـِْة جِـٰٚـِْ✮ِـٰٚـِْمِـٰٚـِْ✮ِـٰٚـِْيِـٰٚـِْ✮ِـٰٚـِْعِـٰٚـِْ✮ِـٰٚـِْ آلِـٰٚـِْ✮ِـٰٚـِْأﯛ̲୭آمِـٰٚـِْ✮ِـٰٚـِْر║]——•\n";
      
commandList.forEach((command, index) => {
  const commandName = command.name.toLowerCase();
  allCommandsMsg += `❏ الإسم : 『${commandName}』\n`;
});
allCommandsMsg += `إجِٰـِۢمِٰـِۢآلِٰـِۢيِٰـِۢ عِٰـِۢدد آلِٰـِۢأﯛ̲୭آمِٰـِۢر : ${totalCommands} أمر\n╰───────────────◊`;
      await api.sendMessage(allCommandsMsg, event.threadID);
    } else if (!isNaN(page) && page > 0 && page <= totalPages) {
      let msg = `\n•——[قٰཻــ͒͜ـًائمـٰة أوُامـٰࢪ ڪاغــِْــٰوُيا ]——• اٰلـٰ̲ـہصـٰ̲ـہفـٰ̲ـہحـٰ̲ـة 🌞🌩 ${page}/${totalPages}:\nإجِٰـِۢمِٰـِۢآلِٰـِۢيِٰـِۢ عِٰـِۢدد آلِٰـِۢأﯛ̲୭آمِٰـِۢر : ${totalCommands} أمر\n`;

      const commandsToDisplay = commandList.slice(startIndex, endIndex);
      commandsToDisplay.forEach((command, index) => {
        const commandNumber = startIndex + index + 1;
        msg += `❍────────────────❍\n\t\t\t\t\tالأمر رقم :  [${commandNumber}]\n\t\t\t\t\tالإسم : 『${command.name}』\n❍────────────────❍\n`;
      });

      msg += "✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏✎\nقم بكتابة *أوامر 'رقم الصفحة' من أجل رؤية باقي الصفحات \nأو قم بكتابة *اوامر الكل من أجل رؤية جميع الأوامر\n✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏✎";

      const randomImageUrl = this.randomImageUrls[Math.floor(Math.random() * this.randomImageUrls.length)];
      const tempImagePath = path.join(this.tempFolder, `random_image_${Date.now()}.jpeg`);

      try {
        const imageResponse = await axios.get(randomImageUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(tempImagePath, Buffer.from(imageResponse.data));
        const attachment = fs.createReadStream(tempImagePath);
        await api.sendMessage({ body: msg, attachment }, event.threadID);
      } catch (error) {
        console.error("حدث خطأ: ", error);
        await api.sendMessage("❌ | حدث خطأ أثناء جلب الصورة.", event.threadID);
      }
    } else {
      await api.sendMessage("❌ | الصفحة غير موجودة.", event.threadID);
    }
  }
}

export default new Help();
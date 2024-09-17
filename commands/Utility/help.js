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
    this.aliases = ["أوامر", "الاوامر"];
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
    const commandsPerPage = 10; // تعديل عدد الأوامر في كل صفحة
    const startIndex = (page - 1) * commandsPerPage;
    const endIndex = page * commandsPerPage;

    const commandList = Array.from(this.commands.values());
    const totalPages = Math.ceil(commandList.length / commandsPerPage);
    const totalCommands = commandList.length;

    if (pageStr && typeof pageStr === 'string' && pageStr.toLowerCase() === 'الكل') {
      let allCommandsMsg = "╭───────────────◊\n•——[قِـٰٚـِْ✮ِـٰٚـِْآئمِـٰٚـِْ✮ِـٰٚـِْة جِـٰٚـِْ✮ِـٰٚـِْمِـٰٚـِْ✮ِـٰٚـِْ عِـٰٚـِْ✮ِـٰٚـِْ آلِـٰٚـِْ✮ِـٰٚـِْأﯛ̲୭آمِـٰٚـِْ✮ِـٰٚـِْر║]——•\n";
      
      commandList.forEach((command, index) => {
        const commandName = command.name.toLowerCase();
        allCommandsMsg += `❏ الإسم : 『${commandName}』\n`;
      });
      allCommandsMsg += `إجِٰـِۢمِٰـِۢآلِٰـِۢيِٰـِۢ عِٰـِۢدد آلِٰـِۢأﯛ̲୭آمِٰـِۢر : ${totalCommands} أمر\n╰───────────────◊`;
      await api.sendMessage(allCommandsMsg, event.threadID);
    } else if (!isNaN(page) && page > 0 && page <= totalPages) {
      let msg = `\n•—[قٰཻــ͒͜ـًائمـٰة أوُامـٰࢪ كَاغــِْــٰوُيا ]—•\n اٰلـٰ̲ـہصـٰ̲ـہفـٰ̲ـہحـٰ̲ـة : ${page}/${totalPages}:\nإجِٰـِۢمِٰـِۢآلِٰـِۢيِٰـِۢ عِٰـِۢدد آلِٰـِۢأﯛ̲୭آمِٰـِۢر : ${totalCommands} أمر\n`;

      const commandsToDisplay = commandList.slice(startIndex, endIndex);
      commandsToDisplay.forEach((command, index) => {
        const commandNumber = startIndex + index + 1;
        msg += `[${commandNumber}] ⬅『${command.name}』`;
      });

      msg += "✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏✎\nقم بالرد برقم الأمر من أجل معرفة مزيد من التفاصيل حوله\nقم بكتابة أوامر 'رقم الصفحة' من أجل رؤية باقي الصفحات \nأو قم بكتابة اوامر الكل من أجل رؤية جميع الأوامر\n✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏✎";

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

  async onReply({ reply, event, api }) {
    // تحقق من أن الشخص الذي يرد هو نفسه الشخص الذي طلب الأوامر
    if (reply.author != event.senderID) return;

    // تحقق من أن الرقم المدخل صحيح ويقع ضمن قائمة الأوامر
    const commandIndex = parseInt(event.body);
    if (isNaN(commandIndex) || commandIndex > reply.commands.length || commandIndex < 1) {
      return api.sendMessage("❌ | الرقم المدخل غير صحيح أو الأمر غير موجود.", event.threadID);
    }

    // الحصول على الأمر بناءً على الرقم المدخل
    const getCommands = reply.commands[commandIndex - 1];

    // روابط الصور (يمكنك تغيير هذه الروابط حسب الحاجة)
    const imageUrls = [
      "https://i.postimg.cc/jj25dynJ/thumb-350-1080006.webp",
      "https://i.postimg.cc/d32QSBpg/thumb-350-1239849.webp",
      "https://i.imgur.com/VZKKBHv.jpeg",
      "https://i.imgur.com/fX5iiTb.png" // قم بتعديل الرابط حسب الحاجة
    ];

    // اختيار صورة (تأكد من تعديل هذا لاختيار الصورة المناسبة بناءً على الأمر أو أي شرط آخر)
    const selectedImage = imageUrls[Math.floor(Math.random() * imageUrls.length)];

    // مسار حفظ الصورة في مجلد temp
    const imagePath = path.join(this.tempFolder, `image_${Date.now()}.jpg`);

    try {
      // تحميل الصورة من الإنترنت
      const response = await axios.get(selectedImage, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data, 'binary');

      // التأكد من وجود مجلد temp
      if (!fs.existsSync(this.tempFolder)) {
        fs.mkdirSync(this.tempFolder, { recursive: true });
      }

      // حفظ الصورة إلى ملف في مجلد temp
      fs.writeFileSync(imagePath, imageBuffer);

      // تحضير الرسالة التي تحتوي على تفاصيل الأمر (الاسم، المؤلف، الوصف، الوقت، إلخ)
      const replyMsg = `◆❯━━━━━▣✦▣━━━━━━❮◆\n🔹 [ ${getCommands.name.toUpperCase()} ]\n`
        + `- ✨ **الاسم**: ${getCommands.name}\n`
        + `- 👤 **المؤلف**: ${getCommands.author}\n`
        + `- ⏱️ **الوقت المستغرق**: ${getCommands.cooldowns} ثواني\n`
        + `- 📜 **الوصف**: ${getCommands.description}\n`
        + `- 🔑 **الدور**: ${this.roleText(getCommands.role)}\n`
        + `- 📝 **الأسماء البديلة**: ${getCommands.aliases.join(', ')}\n`
        + `◆❯━━━━━▣✦▣━━━━━━❮◆`;

      // إرسال تفاصيل الأمر مع الصورة
      const attachment = fs.createReadStream(imagePath);
      await api.sendMessage({ body: replyMsg, attachment }, event.threadID);

      // حذف الصورة من المجلد المؤقت بعد إرسالها
      fs.unlinkSync(imagePath);
    } catch (error) {
      console.error("حدث خطأ: ", error);
      await api.sendMessage("❌ | حدث خطأ أثناء تحميل الصورة أو إرسال التفاصيل.", event.threadID);
    }
  }

  roleText(role) {
    switch (role) {
      case 'admin':
        return 'الآدمنز';
      case 'member':
        return 'الجميع';
      default:
        return 'غير محدد';
    }
  }
}

export default new Help();

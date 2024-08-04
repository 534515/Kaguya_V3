import fs from 'fs';
import path from 'path';

export default {
  name: "بنك",
  author: "Kaguya Project",
  role: "member",
  description: "أوامر البنك المختلفة (رصيدي، إيداع، سحب، تسجيل).",
  async execute({ event, args, api, Economy }) {
    const { getBalance, increase, decrease } = Economy;
    const userID = event.senderID;
    const command = args[0];
    const amount = parseInt(args[1], 10);
    const userInfo = await api.getUserInfo(userID);
    const userName = userInfo[userID]?.name || "Unknown";

    // تحديد مسار ملف البنك
    const bankFilePath = path.join(process.cwd(), 'bank.json');

    // التأكد من وجود ملف البنك
    if (!fs.existsSync(bankFilePath)) {
      fs.writeFileSync(bankFilePath, JSON.stringify({}));
    }

    // قراءة بيانات البنك
    const bankData = JSON.parse(fs.readFileSync(bankFilePath, 'utf8'));

    // تسجيل المستخدم إذا لم يكن مسجلاً
    if (!bankData[userID]) {
      bankData[userID] = { bank: 100, lastInterestClaimed: Date.now() };
      fs.writeFileSync(bankFilePath, JSON.stringify(bankData));
      return api.sendMessage(`أهلاً ${userName}! تم تسجيلك في البنك برصيد ابتدائي قدره 100 دولار.`);
    }

    switch (command) {
      case "رصيدي":
        return api.sendMessage(`رصيد حسابك البنكي هو ${bankData[userID].bank} دولار.`);

      case "إيداع":
        if (isNaN(amount) || amount <= 0) {
          return api.sendMessage("الرجاء إدخال المبلغ الذي ترغب في إيداعه.");
        }
        decrease(amount, userID);
        bankData[userID].bank += amount;
        fs.writeFileSync(bankFilePath, JSON.stringify(bankData));
        return api.sendMessage(`تم إيداع ${amount} دولار في حسابك البنكي.`);

      case "سحب":
        if (isNaN(amount) || amount <= 0) {
          return api.sendMessage("الرجاء إدخال المبلغ الذي ترغب في سحبه.");
        }
        if (bankData[userID].bank < amount) {
          return api.sendMessage("ليس لديك ما يكفي من المال.");
        }
        increase(amount, userID);
        bankData[userID].bank -= amount;
        fs.writeFileSync(bankFilePath, JSON.stringify(bankData));
        return api.sendMessage(`تم سحب ${amount} دولار من حسابك البنكي.`);

      default:
        return api.sendMessage(`❍───────────────❍\n🏦𝙱𝙰𝙽𝙺 𝙺𝙰𝙶𝙺𝙰𝚈𝙰🏦\n\nرصيدي: لعرض رصيدك البنكي\nإيداع [الكمية]: لإيداع الأموال\nسحب [الكمية]: لسحب الأموال\n❍───────────────❍`);
    }
  }
};

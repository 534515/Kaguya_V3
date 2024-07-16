import axios from "axios";
import request from "request";
import fs from "fs-extra";
import path from "path";

const ZiaRein3 = `●═══════❍═══════●\nالــصَـداقَــة هِــي أنْ تَــذهَـبْ وَتَــعُـود وَتَــجــد لِــ نَــفــسَـكْ “ مَــكـانـاً ” بِـيـنَـهُـمْ
قواعد وشروط الجروب♥
1-احترام آراء الآخرين وعدم التلفظ بألفاظ تخدش الحياء
2- الحفاظ على القيم والعادات والتقاليد
3- الحفاظ على تعاليم الدين الاسلامي
4- المرجو التعامل مع المنشورات الجديه بكل حزم وجد والمنشورات الاخرى
يتعامل فيها كل عضو بمايريد مع العلم ان التعليق يعبر عن شخصيتك
5 - عدم وضع صور إباحية ومثيرة جدا وذلك تفاديا لإثارة المشاكل من قبل بعض
الأعضاء
6- عدم إزعاج البنات بطلبات الأضافة داخل الجروب أو الرسائل غير
اللائقة.....يتم تنبيه العضو لمره واحده واذا لم يستجب العضو المعني يحذف
على الفور
7- عدم نشر اي صفحه في هذا للجروب
تنبيه العضو لمره واحده واذا لم يستجب العضو المعني يحذف على الفور
8- التشهير والتشويه لعضو ما او إنسان ما ؟ داخل الجروب يمنع منعا باتا
ويتحمل صاحب الموضوع الجزاء وهوا الحذف النهائي
9- يرجى عدم نشر المنشورات السياسية لكافة الدول العربية و اى عضو سينشر اى
منشور سياسى سيتم تحذيره مرة واحدة و بعد ذلك سيتم طرد العضو
10- أرجو الابلاغ فوراً عن أي شيء مخالف داخل الجروب
11- ممنوع نشر الصور الشخصيه على الجروب او كتابه ارقام الهواتف الخاصه بكم
11_السياسه ممنوعه منعا باتا ..................... وبكرر منمنوع السياسه
منعا باتا
12_ اى شاب يحاول الدخول باسم بنت مصيره #الطرد
.......اي شخص يسيء للجروب سيتم حظره
...... ? فأتمنى أن نبقى اخوة ? .....
لن نجبر أحداً على دخول المجموعة ولا على البقاء فيها !!!
ولكني ألتمس من الموجودين فيها إحترام قوانينها.
المجموعه منكم ولكم وانتم من يتصرف بمجريات الامور وكلنا تقة فيكم
ارجوا من الجميع الالتزام ولكم خالص الشكر والتقدير على التعاون
\n\t\tAdmins\n●═══════❍═══════●`;

const ZiaRein = [
  "https://i.imgur.com/huumLca.jpg",
  "https://i.imgur.com/EcryTGh.jpg",
  "https://i.imgur.com/tu12HrQ.jpg",
  "https://i.imgur.com/Vx25FHG.jpg",
  "https://i.imgur.com/NcbC8Pn.jpg",
];

const ZiaRein2 = (api, event) => {
  api.sendMessage({ body: ZiaRein3, attachment: fs.createReadStream(process.cwd() + "/cache/ZiaRein1.jpg") }, event.threadID, () => {
    fs.unlinkSync(process.cwd() + "/cache/ZiaRein1.jpg");
  }, event.messageID);
};

const execute = async ({ api, event }) => {
  const userListPath = path.join(process.cwd(), "rules.json");
  let userList = [];

  if (fs.existsSync(userListPath)) {
    const data = fs.readFileSync(userListPath, "utf8");
    userList = JSON.parse(data);
  }

  if (userList.includes(event.senderID)) {
    api.setMessageReaction("🚫", event.messageID, () => {}, true);
    return api.sendMessage("❌ | أنت بالفعل وافقت على شروط المجموعة وتم إدراج اسمك بين الأعضاء الرسميين.", event.threadID, event.messageID);
  }

  return request(encodeURI(ZiaRein[Math.floor(Math.random() * ZiaRein.length)]))
    .pipe(fs.createWriteStream(process.cwd() + "/cache/ZiaRein1.jpg"))
    .on("close", () => {
      ZiaRein2(api, event);
      api.sendMessage("رد على هذه الرسالة بـ 'تم' إذا قرأت القواعد ووافقت على شروطها", event.threadID, (err, info) => {
        if (!err) {
          global.client.handler.reply.set(info.messageID, {
            author: event.senderID,
            type: "pick",
            name: "قواعد",
            unsend: true,
          });
        }
      });
    });
};

const onReply = async ({ api, event, reply }) => {
  const userListPath = path.join(process.cwd(), "rules.json");
  let userList = [];

  if (fs.existsSync(userListPath)) {
    const data = fs.readFileSync(userListPath, "utf8");
    userList = JSON.parse(data);
  }

  if (reply.type === "pick" && event.senderID === reply.author) {
    if (event.body.trim().toLowerCase() === "تم") {
      userList.push(event.senderID);
      fs.writeFileSync(userListPath, JSON.stringify(userList, null, 2));

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      api.sendMessage(`تهانينا يا ${event.senderID} أنت الآن قد وافقت على شروط مجموعتنا. نتمنى أن تطبق القواعد وأن تستمتع معنا هنا ☺️`, event.threadID, event.messageID);
    } else {
      api.setMessageReaction("🚫", event.messageID, () => {}, true);
      api.sendMessage("⚠️ | يجب الرد بـ 'تم' لتأكيد الموافقة على القواعد.", event.threadID, event.messageID);
    }
  } else {
    api.setMessageReaction("🚫", event.messageID, () => {}, true);
    api.sendMessage("❌ | لا يمكنك تأكيد الموافقة على القواعد. هذا الرد مخصص للشخص الذي طلب القواعد فقط.", event.threadID, event.messageID);
  }
};

export default {
  name: "قواعد",
  author: "Hussein Yacoubi",
  role: "member",
  description: "Sends a random image with group rules.",
  execute,
  onReply,
};

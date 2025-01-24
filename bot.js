require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");

// Bot token va admin ID
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const adminChatId = process.env.ADMIN_CHAT_ID;
const groupChatId = "-4741307801"; // Yangi guruh ID'si

// Fayllar yo‘llari
const pdfPath = path.join(__dirname, "assets/Ma'lumot.pdf");

// Foydalanuvchi ma'lumotlarini vaqtinchalik saqlash
const userInfo = {};

// /start buyrug‘ini boshqarish
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // 3 ta xabarni yuborish
  bot.sendMessage(
    chatId,
    "Assalomu Aleykum. Botga xush kelibsiz! 🎉\nDrBeeze - 100% tabiiy va halol mahsulot 🌿.",
    { parse_mode: "Markdown" }
  );
  bot.sendMessage(
    chatId,
    "Video qo’llanmani olish uchun *ismingizni* kiriting 👇  📩:",
    { parse_mode: "MarkdownV2" }
  );

  // Foydalanuvchining ismini so‘rash
  userInfo[chatId] = { step: "name" };
});

// Xabarlarni boshqarish
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  // Foydalanuvchi ism kiritayotganda
  if (userInfo[chatId]?.step === "name") {
    userInfo[chatId].name = msg.text.trim();
    userInfo[chatId].step = "phone";

    // Telefon raqamini so‘rash
    bot.sendMessage(chatId, "Telefon raqamingizni yuboring (format: +998901234567):", {
      reply_markup: {
        keyboard: [[{ text: "📞 Kontaktni yuborish", request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
    return;
  }

  // Foydalanuvchi telefon raqamini kiritayotganda
  if (userInfo[chatId]?.step === "phone") {
    if (msg.contact) {
      // Telefon raqami kontaktdan olinganda
      userInfo[chatId].phone = msg.contact.phone_number;
      userInfo[chatId].step = "done";

      // Foydalanuvchiga fayllarni yuborish
      sendFilesToUser(chatId);
    } else if (/^\+998\d{9}$/.test(msg.text.trim())) {
      // Telefon raqami matn sifatida to'g'ri formatda kiritilganida
      userInfo[chatId].phone = msg.text.trim();
      userInfo[chatId].step = "done";

      // Foydalanuvchiga fayllarni yuborish
      sendFilesToUser(chatId);
    } else {
      bot.sendMessage(chatId, "Iltimos, telefon raqamingizni to‘g‘ri formatda kiriting.");
    }
    return;
  }

  // Buyurtma berish tugmasi bosilganda
  if (msg.text === "📦 Buyurtma berish" && userInfo[chatId]?.step === "done") {
    const { name, phone } = userInfo[chatId];

    // Guruhga ma'lumotlarni yuborish
    bot.sendMessage(
      groupChatId,
      `📦 *Yangi buyurtma:*\n\n👤 *Ismi:* ${name}\n📞 *Telefon:* ${phone}`,
      { parse_mode: "Markdown" }
    )
      .then(() => {
        bot.sendMessage(chatId, "Buyurtmangiz qabul qilindi! Tez orada bog‘lanamiz. 😊");
      })
      .catch((error) => {
        console.error("Guruhga xabar yuborishda xatolik:", error.message);
        bot.sendMessage(chatId, "Xatolik yuz berdi. Iltimos, keyinroq qaytadan urinib ko'ring.");
      });
  }
});

// Foydalanuvchiga fayllarni yuborish funksiyasi
function sendFilesToUser(chatId) {
  bot.sendMessage(chatId, "Rahmat! Mana sizga video va PDF 📑:");
  bot.sendMessage(chatId, "YouTube videosini tomosha qiling: https://www.youtube.com/watch?v=eQUW4Mk9lxo");
  bot.sendDocument(chatId, fs.createReadStream(pdfPath));

  // Buyurtma berish tugmasini ko‘rsatish
  bot.sendMessage(chatId, "Buyurtma berish uchun quyidagi tugmani bosing 📦:", {
    reply_markup: {
      keyboard: [["📦 Buyurtma berish"]],
      resize_keyboard: true,
    },
  });
}

// Logs papkasini tekshirish va yaratish
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Kontaktlarni logga yozish funksiyasi
const logContact = (contact) => {
  const logPath = path.join(logsDir, "contact_log.txt");
  const logMessage = `Ism: ${contact.first_name}, Telefon: ${contact.phone_number}\n`;

  // Faylga yozish
  fs.appendFile(logPath, logMessage, (err) => {
    if (err) {
      console.error("Log yozishda xatolik yuz berdi:", err);
    }
  });
};

module.exports = { logContact };

console.log("Bot ishga tushdi33!");

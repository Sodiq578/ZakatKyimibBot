const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");

// Bot tokenini o'rnating
const token = "7892010861:AAGdrQwe3KiF01v9ibCQklz_wkAGFWQC1Ys";
const bot = new TelegramBot(token, { polling: true });

// Foydalanuvchilar holatini saqlash uchun obyekt
const userState = {};

// Mahsulotlar ma'lumotlari
const catalogProducts = [
  {
    name_uz: "Xudy",
    name_ru: "Худи",
    priceSum: 300000 , // Yaxshiroq ko'rinishda
    price: "Tabiiy paxta: 80%. Yumshoq va qulay material.",
    price_ru: "Натуральный хлопок: 80%. Мягкий и удобный материал.",
    videoPath: path.join(__dirname, "assets/videos/video1.mp4"),
    imagePath: path.join(__dirname, "assets/images/Jigar-Tshirt.jpg"),
  },
  {
    name_uz: "Futbolka",
    name_ru: "Футболка",
    priceSum: "60,000 so'm", // Yaxshiroq ko'rinishda
    price: "Tabiiy paxta: 100%. Nafas oluvchi mato.",
    price_ru: "Натуральный хлопок: 100%.",
    videoPath: path.join(__dirname, "assets/videos/video2.mp4"),
    imagePath: path.join(__dirname, "assets/images/Jigar-Tshirt.jpg"),
  },
  {
    name_uz: "Svitshot",
    name_ru: "Свитшот",
    priceSum: "80,000 so'm", // Yaxshiroq ko'rinishda
    price: "Tabiiy paxta: 85%, Polyester: 15%. Issiqlikni ushlab turuvchi mato.",
    price_ru: "Натуральный хлопок: 85%, Полиэстер: 15%. Ткань сохраняет тепло.",
    videoPath: path.join(__dirname, "assets/videos/video4.mp4"),
    imagePath: path.join(__dirname, "assets/images/Jigar-Tshirt.jpg"),
  },
];



// Til tanlash
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userState[chatId] = { step: "language", username: msg.from.username };
  bot.sendMessage(chatId, "Tilni tanlang / Выберите язык:", {
    reply_markup: {
      keyboard: [["🇺🇿 O'zbek tili", "🇷🇺 Русский язык"]],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
});

// Til tanlangandan keyin
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const user = userState[chatId];

  if (!user) return;

  if (user.step === "language") {
    if (text === "🇺🇿 O'zbek tili" || text === "🇷🇺 Русский язык") {
      user.language = text;
      user.step = "mainMenu";
      showMainMenu(chatId, user.language);
    }
  } else if (user.step === "mainMenu") {
    if (
      text === (user.language === "🇺🇿 O'zbek tili" ? "🛍 Katalog" : "🛍 Каталог")
    ) {
      user.step = "products";
      showProducts(chatId, user.language);
    } else if (
      text ===
      (user.language === "🇺🇿 O'zbek tili"
        ? "📞 Bizga aloqa"
        : "📞 Связаться с нами")
    ) {
      user.step = "contact";
      showContact(chatId, user.language);
    } else if (
      text ===
      (user.language === "🇺🇿 O'zbek tili"
        ? "🌐 Ijtimoiy tarmoqlar"
        : "🌐 Социальные сети")
    ) {
      user.step = "socialMedia";
      showSocialMedia(chatId, user.language);
    } else if (
      text ===
      (user.language === "🇺🇿 O'zbek tili"
        ? "🎨 O'z dizayningni yaratish"
        : "🎨 Создать свой дизайн")
    ) {
      user.step = "createDesign";
      showCreateDesign(chatId, user.language);
    }
  } else if (user.step === "products") {
    const product = catalogProducts.find(
      (p) => p.name_uz === text || p.name_ru === text
    );
    if (product) {
      user.selectedProduct = product;
      user.step = "inspirationalMessages";
      showInspirationalMessages(chatId, user.language);
    } else if (
      text === (user.language === "🇺🇿 O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад")
    ) {
      user.step = "mainMenu";
      showMainMenu(chatId, user.language);
    }
  } else if (user.step === "inspirationalMessages") {
    if (
      text ===
      (user.language === "🇺🇿 O'zbek tili"
        ? "🎨 Rangni tanlash"
        : "🎨 Выбрать цвет")
    ) {
      user.step = "selectColor";
      showColorOptions(chatId, user.language);
    } else if (
      text === (user.language === "🇺🇿 O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад")
    ) {
      user.step = "products";
      showProducts(chatId, user.language);
    } else {
      user.selectedMessage = text; // Tanlangan ilhomlantiruvchi so'zni saqlash
      user.step = "selectColor";
      showColorOptions(chatId, user.language);
    }
  } else if (user.step === "selectColor") {
    user.selectedColor = text;
    user.step = "selectSize";
    showSizeOptions(chatId, user.language);
  } else if (user.step === "selectSize") {
    user.selectedSize = text;
    user.step = "productDetails"; // Mahsulot tafsilotlarini ko'rsatish bosqichi
    showProductDetails(chatId, user.language, user.selectedProduct);
  } else if (user.step === "productDetails") {
    if (
      text ===
      (user.language === "🇺🇿 O'zbek tili"
        ? "🛒 Savatchaga qo'shish va buyurtmani davom etish"
        : "🛒 Добавить в корзину и продолжить заказ")
    ) {
      user.step = "confirmOrder";
      confirmOrder(chatId, user.language);
    } else if (
      text === (user.language === "🇺🇿 O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад")
    ) {
      user.step = "selectSize";
      showSizeOptions(chatId, user.language);
    }
  } else if (user.step === "confirmOrder") {
    if (
      text ===
      (user.language === "🇺🇿 O'zbek tili" ? "✅ Tasdiqlash" : "✅ Подтвердить")
    ) {
      user.step = "askPhoneNumber";
      bot.sendMessage(
        chatId,
        user.language === "🇺🇿 O'zbek tili"
          ? "Iltimos, telefon raqamingizni yuboring:"
          : "Пожалуйста, отправьте ваш номер телефона:",
        {
          reply_markup: {
            keyboard: [
              [
                {
                  text:
                    user.language === "🇺🇿 O'zbek tili"
                      ? "📞 Telefon raqamni yuborish"
                      : "📞 Отправить номер телефона",
                  request_contact: true,
                },
              ],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        }
      );
    } else if (
      text === (user.language === "🇺🇿 O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад")
    ) {
      user.step = "productDetails";
      showProductDetails(chatId, user.language, user.selectedProduct);
    }
  } else if (user.step === "askPhoneNumber") {
    if (msg.contact) {
      user.phoneNumber = msg.contact.phone_number;
      user.step = "selectPaymentMethod";
      showPaymentMethods(chatId, user.language);
    } else {
      bot.sendMessage(
        chatId,
        user.language === "🇺🇿 O'zbek tili"
          ? "Iltimos, telefon raqamingizni yuboring."
          : "Пожалуйста, отправьте ваш номер телефона."
      );
    }
  } else if (user.step === "selectPaymentMethod") {
    if (
      text === (user.language === "🇺🇿 O'zbek tili" ? "Click" : "Click") ||
      text === (user.language === "🇺🇿 O'zbek tili" ? "Payme" : "Payme") ||
      text === (user.language === "🇺🇿 O'zbek tili" ? "Naqd" : "Naqd")
    ) {
      user.selectedPaymentMethod = text;
      sendOrderToAdmin(chatId, user.language);
      bot.sendMessage(
        chatId,
        user.language === "🇺🇿 O'zbek tili"
          ? "Buyurtma qabul qilindi!\nBotni yana ishga tushirish uchun /start buyrug'ini bosing."
          : "Заказ принят!\nЧтобы перезапустить бота, нажмите /start."
      );
      
      delete userState[chatId];
      showMainMenu(chatId, user.language);
    } else if (
      text === (user.language === "🇺🇿 O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад")
    ) {
      user.step = "confirmOrder";
      confirmOrder(chatId, user.language);
    }
  }
});

// Asosiy menyuni ko'rsatish
function showMainMenu(chatId, language) {
  bot.sendMessage(
    chatId,
    language === "🇺🇿 O'zbek tili"
      ? "Asosiy menyuni tanlang:"
      : "Выберите главное меню:",
    {
      reply_markup: {
        keyboard: [
          [
            { text: language === "🇺🇿 O'zbek tili" ? "🛍 Katalog" : "🛍 Каталог" },
            {
              text:
                language === "🇺🇿 O'zbek tili"
                  ? "📞 Bizga aloqa"
                  : "📞 Связаться с нами",
            },
          ],
          [
            {
              text:
                language === "🇺🇿 O'zbek tili"
                  ? "🌐 Ijtimoiy tarmoqlar"
                  : "🌐 Социальные сети",
            },
            {
              text:
                language === "🇺🇿 O'zbek tili"
                  ? "🎨 O'z dizayningni yaratish"
                  : "🎨 Создать свой дизайн",
            },
          ],
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
      },
    }
  );
}

// Mahsulotlarni ko'rsatish
function showProducts(chatId, language) {
  const productNames = catalogProducts.map((p) =>
    language === "🇺🇿 O'zbek tili" ? p.name_uz : p.name_ru
  );

  // Mahsulotlarni 2 tadan qatorlarga bo'lish
  const productButtons = [];
  for (let i = 0; i < productNames.length; i += 2) {
    productButtons.push(productNames.slice(i, i + 2)); // Har bir qatorda 2 tadan tugma
  }

  // "Orqaga" tugmasini oxirgi qatorga qo'shish
  productButtons.push([
    language === "🇺🇿 O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад",
  ]);

  bot.sendMessage(
    chatId,
    language === "🇺🇿 O'zbek tili" ? "Mahsulotni tanlang:" : "Выберите продукт:",
    {
      reply_markup: {
        keyboard: productButtons,
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }
  );
}

// Ilhomlantiruvchi so'zlar
function showInspirationalMessages(chatId, language) {
  const messages =
    language === "🇺🇿 O'zbek tili"
      ? [
          "Orzu qil, harakat qil, erish!",
          "Bugun boshlamasang, ertaga kech bo‘ladi.",
          "Harakat – muvaffaqiyat kaliti.",
          "Yutqazish – bu faqat yangi imkoniyat.",
          "O‘zgarishni xohlasang, avvalo o‘zing o‘zgargin.",
          "Katta natijalar kichik qadamlardan boshlanadi.",
          "Aql – oltindan qimmat.",
          "Vaqtni qadrlagan inson yutadi.",
          "Omad – tayyorgarlik va imkoniyat uchrashgan joy.",
          "Bilim – eng yaxshi sarmoya.",
          "Baxt boylikda emas, qalb tinchligida.",
          "Har bir xato – yangi saboq.",
        ]
      : [
          "Мечтай, действуй, достигай!",
          "Если не начнешь сегодня, завтра будет поздно.",
          "Действие – ключ к успеху.",
          "Поражение – это просто новая возможность.",
          "Если хочешь изменить мир, начни с себя.",
          "Большие результаты начинаются с маленьких шагов.",
          "Ум дороже золота.",
          "Тот, кто ценит время, побеждает.",
          "Удача – это встреча подготовки и возможности.",
          "Знание – лучшая инвестиция.",
          "Счастье не в богатстве, а в душевном покое.",
          "Каждая ошибка – это новый урок.",
        ];

  // Xabarlarni ikki qator qilib ajratish
  const buttons = [];
  for (let i = 0; i < messages.length; i += 2) {
    buttons.push([
      { text: messages[i] },
      { text: messages[i + 1] ? messages[i + 1] : "" },
    ]);
  }

  // Qo'shimcha tugmalar (rangni tanlash va orqaga)


  buttons.push([
    {
      text:
        language === "🇺🇿 O'zbek tili" ? "🎨 Rangni tanlash" : "🎨 Выбрать цвет",
    },
  ]);
  buttons.push([
    { text: language === "🇺🇿 O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад" },
  ]);

  bot.sendMessage(
    chatId,
    language === "🇺🇿 O'zbek tili"
      ? "Yozilishi kerak bo'lgan so'zlar:"
      : "Вдохновляющие сообщения:",
    {
      reply_markup: {
        keyboard: buttons,
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }
  );
}

// Rang tanlash tugmalarini ko'rsatish
function showColorOptions(chatId, language) {
  const colors = [
    ["⚫️ Qora", "⚪️ Oq"], 
    ["🟡 Sariq", "🟢 Yashil"]
  ];

  bot.sendMessage(
    chatId,
    language === "🇺🇿 O'zbek tili" ? "Rangni tanlang:" : "Выберите цвет:",
    {
      reply_markup: {
        keyboard: [
          ...colors,  // Rang tugmalarini qo‘shish (2 qator)
          [language === "🇺🇿 O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад"],  // Orqaga tugmasi
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }
  );
}


// O'lcham tanlash tugmalarini ko'rsatish
function showSizeOptions(chatId, language) {
  const sizes = ["XXS - O‘ta kichik",
    "XS - Kichik",
    "S - O‘rtacha kichik",
    "M - O‘rta",
    "L - Katta",
    "XL - Ekstra katta",
    "XXL - O‘ta katta",
    "XXXL - Juda katta",
    "Qora - Rang",
    "Oq - Rang",
    "Yashil - Rang",
    "Kanvas - Material",
    "Jins - Material",];

  // 2 tadan tugma qo'yish uchun keyboard massivini tuzamiz
  const keyboard = [];
  for (let i = 0; i < sizes.length; i += 2) {
    keyboard.push(sizes.slice(i, i + 2)); // Har bir qatorda 2 tadan tugma bo'ladi
  }

  // "Orqaga" tugmasini oxirgi qatorda joylashtiramiz
  keyboard.push([language === "🇺🇿 O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад"]);

  bot.sendMessage(
    chatId,
    language === "🇺🇿 O'zbek tili"
      ? "📏 O'lchamni tanlang:"
      : "📏 Выберите размер:",
    {
      reply_markup: {
        keyboard: keyboard,
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }
  );
}




// Mahsulot tafsilotlarini ko'rsatish
function showProductDetails(chatId, language, product) {
  const priceSum = 300000;
  const caption =
    language === "🇺🇿 O'zbek tili"
      ? `Mahsulot: ${product.name_uz}\nNarx: ${product.price}\nYagona narx: ${priceSum}`
      : `Продукт: ${product.name_ru}\nЦена: ${product.price_ru}\nЦена: ${priceSum}`;

  bot.sendMessage(chatId, caption);
  bot.sendPhoto(chatId, fs.readFileSync(product.imagePath));
  bot.sendVideo(chatId, fs.readFileSync(product.videoPath), {
    reply_markup: {
      keyboard: [
        [
          {
            text:
              language === "🇺🇿 O'zbek tili"
                ? "🛒 Savatchaga qo'shish va buyurtmani davom etish"
                : "🛒 Добавить в корзину и продолжить заказ",
          },
        ],
        [{ text: language === "🇺🇿 O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад" }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
}

// Buyurtmani tasdiqlash
function confirmOrder(chatId, language) {
  const priceSum = 300000;
  const orderDetails =
    language === "🇺🇿 O'zbek tili"
      ? `📌 Buyurtma ma'lumotlari:\n📦 Mahsulot: ${userState[chatId].selectedProduct.name_uz}\n🎨 Rang: ${userState[chatId].selectedColor}\n📏 O'lcham: ${userState[chatId].selectedSize}\n💬 Tanlangan so'z: ${userState[chatId].selectedMessage}\n💰 Malumot: ${priceSum.toLocaleString()} so'm`
      : `📌 Детали заказа:\n📦 Продукт: ${userState[chatId].selectedProduct.name_ru}\n🎨 Цвет: ${userState[chatId].selectedColor}\n📏 Размер: ${userState[chatId].selectedSize}\n💬 Выбранное сообщение: ${userState[chatId].selectedMessage}\n💰 Malumot: ${priceSum.toLocaleString()} сум`;

  bot.sendMessage(chatId, orderDetails, {
    reply_markup: {
      keyboard: [
        [
          {
            text:
              language === "🇺🇿 O'zbek tili"
                ? "✅ Tasdiqlash"
                : "✅ Подтвердить",
          },
        ],
        [{ text: language === "🇺🇿 O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад" }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
}

// Buyurtmani admin ga yuborish
function sendOrderToAdmin(chatId, language) {
  const priceSum = 300000;
  const orderDetails =
    language === "🇺🇿 O'zbek tili"
      ? `🆕 Yangi buyurtma:\n👤 Foydalanuvchi: @${userState[chatId].username}\n🆔 Chat ID: ${chatId}\n📦 Mahsulot: ${userState[chatId].selectedProduct.name_uz}\n🎨 Rang: ${userState[chatId].selectedColor}\n📏 O'lcham: ${userState[chatId].selectedSize}\n💬 Tanlangan so'z: ${userState[chatId].selectedMessage}\n💰 Narx: ${priceSum.toLocaleString()} so'm\n💳 To'lov usuli: ${userState[chatId].selectedPaymentMethod}\n📞 Telefon raqam: ${userState[chatId].phoneNumber}`
      : `🆕 Новый заказ:\n👤 Пользователь: @${userState[chatId].username}\n🆔 Chat ID: ${chatId}\n📦 Продукт: ${userState[chatId].selectedProduct.name_ru}\n🎨 Цвет: ${userState[chatId].selectedColor}\n📏 Размер: ${userState[chatId].selectedSize}\n💬 Выбранное сообщение: ${userState[chatId].selectedMessage}\n💰 Цена: ${priceSum.toLocaleString()} сум\n💳 Способ оплаты: ${userState[chatId].selectedPaymentMethod}\n📞 Телефон: ${userState[chatId].phoneNumber}`;

  const adminBotToken = "7892010861:AAGdrQwe3KiF01v9ibCQklz_wkAGFWQC1Ys";
  const adminChatId = "-4707143908";
  const adminBot = new TelegramBot(adminBotToken, { polling: false });

  adminBot.sendMessage(adminChatId, orderDetails);
}



// To'lov usullarini ko'rsatish
function showPaymentMethods(chatId, language) {
  bot.sendMessage(
    chatId,
    language === "🇺🇿 O'zbek tili"
      ? "To'lov usulini tanlang:"
      : "Выберите способ оплаты:",
    {
      reply_markup: {
        keyboard: [
          [
            { text: "Click" },
            { text: "Payme" },
            
          ],
          [{ text: language === "🇺🇿 O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад" }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }
  );
}
 
// Aloqa ma'lumotlari
function showContact(chatId, language) {
  const contactInfo =
    language === "🇺 Uzbek tili"
      ? "Biz bilan bog'lanish uchun:\nTelefon: +998974634455\nEmail: info@example.com"
      : "Для связи с нами:\nТелефон: +998974634455\nEmail: info@example.com";

  bot.sendMessage(chatId, contactInfo, {
    reply_markup: {
      keyboard: [
        [{ text: language === "🇺 Uzbek tili" ? "🔙 Orqaga" : "🔙 Назад" }],  // Orqaga tugmasi
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });

  // Foydalanuvchini asosiy menyuga qaytarish, biroz kutib
  userState[chatId].step = "mainMenu";

  // Foydalanuvchi xabarni olganidan keyin asosiy menyuga qaytishi
  setTimeout(() => {
    showMainMenu(chatId, language);
  }, 3000); // 3 sekund kutish
}

// Ijtimoiy tarmoqlar
function showSocialMedia(chatId, language) {
  const socialMediaLinks =
    language === "🇺 Uzbek tili"
      ? "Bizning ijtimoiy tarmoqlar:\nInstagram: https://instagram.com/example\nTelegram: https://t.me/example"
      : "Наши социальные сети:\nInstagram: https://instagram.com/example\nTelegram: https://t.me/example";

  bot.sendMessage(chatId, socialMediaLinks, {
    reply_markup: {
      keyboard: [
        [{ text: language === "🇺 Uzbek tili" ? "🔙 Orqaga" : "🔙 Назад" }],  // Orqaga tugmasi
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });

  // Foydalanuvchini asosiy menyuga qaytarish, biroz kutib
  userState[chatId].step = "mainMenu";

  // Foydalanuvchi xabarni olganidan keyin asosiy menyuga qaytishi
  setTimeout(() => {
    showMainMenu(chatId, language);
  }, 3000); // 3 sekund kutish
}


// Ijtimoiy tarmoqlar
// Aloqa ma'lumotlari
function showContact(chatId, language) {
  const contactInfo =
    language === "🇺🇿 O'zbek tili"
      ? "Biz bilan bog'lanish uchun:\nTelefon: +998974634455\nEmail: info@example.com"
      : "Для связи с нами:\nТелефон: +998974634455\nEmail: info@example.com";

  bot.sendMessage(chatId, contactInfo, {
    reply_markup: {
      keyboard: [
        [{ text: language === "🇺🇿 O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад" }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });

  // Foydalanuvchini asosiy menyuga qaytarish
  userState[chatId].step = "mainMenu";
  showMainMenu(chatId, language);
}

// Ijtimoiy tarmoqlar
function showSocialMedia(chatId, language) {
  const socialMediaLinks =
    language === "🇺🇿 O'zbek tili"
      ? "Bizning ijtimoiy tarmoqlar:\nInstagram: https://instagram.com/example\nTelegram: https://t.me/example"
      : "Наши социальные сети:\nInstagram: https://instagram.com/example\nTelegram: https://t.me/example";

  bot.sendMessage(chatId, socialMediaLinks, {
    reply_markup: {
      keyboard: [
        [{ text: language === "🇺🇿 O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад" }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });

  // Foydalanuvchini asosiy menyuga qaytarish
  userState[chatId].step = "mainMenu";
  showMainMenu(chatId, language);
}

// O'z dizayningni yaratish
function showCreateDesign(chatId, language) {
  const designBotLink = "@yangidizayn1_bot"; // Dizayn yaratish boti
  const message =
    language === "🇺🇿 O'zbek tili"
      ? `🎨 *O'z dizayningni yarat!* 🎨\n\n📌 _Zamonaviy va o'ziga xos dizayn yaratish uchun_ quyidagi botga o'ting 👇\n\n🚀 [@yangidizayn1_bot](${designBotLink})`
      : `🎨 *Создайте свой уникальный дизайн!* 🎨\n\n📌 _Для создания стильного и индивидуального дизайна_ перейдите в бота 👇\n\n🚀 [@yangidizayn1_bot](${designBotLink})`;

  bot.sendMessage(chatId, message, { parse_mode: "Markdown" }, {
    reply_markup: {
      keyboard: [
        [{ text: language === "🇺🇿 O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад" }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });

  // Foydalanuvchini asosiy menyuga qaytarish
  userState[chatId].step = "mainMenu";
  showMainMenu(chatId, language);
}

console.log("Bot ishga tushdssssssssssssssi!");

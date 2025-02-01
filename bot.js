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
    price: "Tabiiy paxta: 80%. Yumshoq va qulay material. Narxi: 30 000 UZS",
    price_ru:
      "Натуральный хлопок: 80%. Мягкий и удобный материал. Цена: 30 000 UZS",
    videoPath: path.join(__dirname, "assets/videos/video1.mp4"),
    imagePath: path.join(__dirname, "assets/images/Jigar-Tshirt.jpg"),
  },
  {
    name_uz: "Futbolka",
    name_ru: "Футболка",
    price: "Tabiiy paxta: 100%. Nafas oluvchi mato. Narxi: 60 000 UZS",
    price_ru: "Натуральный хлопок: 100%. Дышащая ткань. Цена: 60 000 UZS",
    videoPath: path.join(__dirname, "assets/videos/video2.mp4"),
    imagePath: path.join(__dirname, "assets/images/Jigar-Tshirt.jpg"),
  },
  {
    name_uz: "Svitshot",
    name_ru: "Свитшот",
    price:
      "Tabiiy paxta: 85%, Polyester: 15%. Issiqlikni ushlab turuvchi mato. Narxi: 80 000 UZS",
    price_ru:
      "Натуральный хлопок: 85%, Полиэстер: 15%. Ткань сохраняет тепло. Цена: 80 000 UZS",
    videoPath: path.join(__dirname, "assets/videos/video4.mp4"),
    imagePath: path.join(__dirname, "assets/images/Jigar-Tshirt.jpg"),
  },
  {
    name_uz: "Shim",
    name_ru: "Штаны",
    price:
      "Tabiiy paxta: 90%, Elastan: 10%. Qulay va elastik. Narxi: 50 000 UZS",
    price_ru:
      "Натуральный хлопок: 90%, Эластан: 10%. Удобные и эластичные. Цена: 50 000 UZS",
    videoPath: path.join(__dirname, "assets/videos/video5.mp4"),
    imagePath: path.join(__dirname, "assets/images/Jigar-Tshirt.jpg"),
  },
  {
    name_uz: "Kurtka",
    name_ru: "Куртка",
    price: "Sintetik material: 100%. Suv o'tkazmaydigan. Narxi: 120 000 UZS",
    price_ru:
      "Синтетический материал: 100%. Водонепроницаемая. Цена: 120 000 UZS",
    videoPath: path.join(__dirname, "assets/videos/video6.mp4"),
    imagePath: path.join(__dirname, "assets/images/Jigar-Tshirt.jpg"),
  },
  {
    name_uz: "Ko'ylak",
    name_ru: "Платье",
    price: "Ipak: 100%. Zamonaviy dizayn. Narxi: 90 000 UZS",
    price_ru: "Шелк: 100%. Современный дизайн. Цена: 90 000 UZS",
    videoPath: path.join(__dirname, "assets/videos/video7.mp4"),
    imagePath: path.join(__dirname, "assets/images/Jigar-Tshirt.jpg"),
  },
  {
    name_uz: "Shortik",
    name_ru: "Шорты",
    price:
      "Tabiiy paxta: 70%, Polyester: 30%. Yengil va qulay. Narxi: 40 000 UZS",
    price_ru:
      "Натуральный хлопок: 70%, Полиэстер: 30%. Легкие и удобные. Цена: 40 000 UZS",
    videoPath: path.join(__dirname, "assets/videos/video8.mp4"),
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

// Mahsulotlarni ko'rsatish
function showProducts(chatId, language) {
  const productNames = catalogProducts.map((p) =>
    language === "O'zbek tili" ? p.name_uz : p.name_ru
  );

  // Mahsulotlarni 2 tadan qatorlarga bo'lish
  const productButtons = [];
  for (let i = 0; i < productNames.length; i += 2) {
    productButtons.push(productNames.slice(i, i + 2)); // Har bir qatorda 2 tadan tugma
  }

  // "Orqaga" tugmasini oxirgi qatorga qo'shish
  productButtons.push([language === "O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад"]);

  bot.sendMessage(
    chatId,
    language === "O'zbek tili" ? "Mahsulotni tanlang:" : "Выберите продукт:",
    {
      reply_markup: {
        keyboard: productButtons,
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }
  );
}

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
      user.step = "productDetails";
      showProductDetails(chatId, user.language, product);
    } else if (
      text === (user.language === "🇺🇿 O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад")
    ) {
      user.step = "mainMenu";
      showMainMenu(chatId, user.language);
    }
  } else if (user.step === "productDetails") {
    if (
      text ===
      (user.language === "🇺🇿 O'zbek tili"
        ? "🛒 Savatchaga qo'shish va buyurtmani davom etish"
        : "🛒 Добавить в корзину и продолжить заказ")
    ) {
      user.step = "inspirationalMessages";
      showInspirationalMessages(chatId, user.language);
    } else if (
      text === (user.language === "🇺🇿 O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад")
    ) {
      user.step = "products";
      showProducts(chatId, user.language);
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
      user.step = "productDetails";
      showProductDetails(chatId, user.language, user.selectedProduct);
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
    user.step = "selectQuantity";
    bot.sendMessage(
      chatId,
      user.language === "🇺🇿 O'zbek tili"
        ? "Miqdorni kiriting:"
        : "Введите количество:"
    );
  } else if (user.step === "selectQuantity") {
    user.selectedQuantity = parseInt(text);
    user.step = "confirmOrder";
    confirmOrder(chatId, user.language);
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
          ? "Buyurtma qabul qilindi!"
          : "Заказ принят!"
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
          [{ text: language === "🇺🇿 O'zbek tili" ? "🛍 Katalog" : "🛍 Каталог" }],
          [
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
          ],
          [
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
  bot.sendMessage(
    chatId,
    language === "🇺🇿 O'zbek tili" ? "Mahsulotni tanlang:" : "Выберите продукт:",
    {
      reply_markup: {
        keyboard: [
          productNames,
          [language === "🇺🇿 O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад"],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }
  );
}

// Mahsulot tafsilotlarini ko'rsatish
function showProductDetails(chatId, language, product) {
  const caption =
    language === "🇺🇿 O'zbek tili"
      ? `Mahsulot: ${product.name_uz}\nNarxi: ${product.price}\nTavsif: ${product.price}`
      : `Продукт: ${product.name_ru}\nЦена: ${product.price_ru}\nОписание: ${product.price_ru}`;

  // Rasm yuborish
  bot.sendPhoto(chatId, fs.readFileSync(product.imagePath), {
    caption: caption,
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

  // Video yuborish
  bot.sendVideo(chatId, fs.readFileSync(product.videoPath));
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

  const buttons = messages.map((message) => [{ text: message }]);
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
  const colors = ["⚫️ Qora", "⚪️ Oq", "🟡 Sariq", "🟢 Yashil"];
  bot.sendMessage(
    chatId,
    language === "🇺🇿 O'zbek tili" ? "Rangni tanlang:" : "Выберите цвет:",
    {
      reply_markup: {
        keyboard: [
          colors,
          [language === "🇺🇿 O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад"],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }
  );
}

// O'lcham tanlash tugmalarini ko'rsatish
function showSizeOptions(chatId, language) {
  const sizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

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

// Buyurtmani tasdiqlash
function confirmOrder(chatId, language) {
  const orderDetails =
    language === "🇺🇿 O'zbek tili"
      ? `Buyurtma ma'lumotlari:\nMahsulot: ${userState[chatId].selectedProduct.name_uz}\nRang: ${userState[chatId].selectedColor}\nO'lcham: ${userState[chatId].selectedSize}\nMiqdor: ${userState[chatId].selectedQuantity}\nTanlangan so'z: ${userState[chatId].selectedMessage}`
      : `Детали заказа:\nПродукт: ${userState[chatId].selectedProduct.name_ru}\nЦвет: ${userState[chatId].selectedColor}\nРазмер: ${userState[chatId].selectedSize}\nКоличество: ${userState[chatId].selectedQuantity}\nВыбранное сообщение: ${userState[chatId].selectedMessage}`;

  bot.sendMessage(chatId, orderDetails, {
    reply_markup: {
      keyboard: [
        [
          {
            text:
              language === "🇺🇿 O'zbek tili" ? "✅ Tasdiqlash" : "✅ Подтвердить",
          },
        ],
        [{ text: language === "🇺🇿 O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад" }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
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
            { text: language === "🇺🇿 O'zbek tili" ? "Naqd" : "Naqd" },
          ],
          [{ text: language === "🇺🇿 O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад" }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    }
  );
}

// Buyurtmani admin ga yuborish
function sendOrderToAdmin(chatId, language) {
  const orderDetails =
    language === "🇺🇿 O'zbek tili"
      ? `Yangi buyurtma:\nFoydalanuvchi: @${userState[chatId].username}\nChat ID: ${chatId}\nMahsulot: ${userState[chatId].selectedProduct.name_uz}\nRang: ${userState[chatId].selectedColor}\nO'lcham: ${userState[chatId].selectedSize}\nMiqdor: ${userState[chatId].selectedQuantity}\nTanlangan so'z: ${userState[chatId].selectedMessage}\nTo'lov usuli: ${userState[chatId].selectedPaymentMethod}\nTelefon raqam: ${userState[chatId].phoneNumber}`
      : `Новый заказ:\nПользователь: @${userState[chatId].username}\nChat ID: ${chatId}\nПродукт: ${userState[chatId].selectedProduct.name_ru}\nЦвет: ${userState[chatId].selectedColor}\nРазмер: ${userState[chatId].selectedSize}\nКоличество: ${userState[chatId].selectedQuantity}\nВыбранное сообщение: ${userState[chatId].selectedMessage}\nСпособ оплаты: ${userState[chatId].selectedPaymentMethod}\nТелефон: ${userState[chatId].phoneNumber}`;

  const adminBotToken = "7892010861:AAGdrQwe3KiF01v9ibCQklz_wkAGFWQC1Ys"; // Admin bot token
  const adminChatId = "-4707143908"; // Guruh chat ID
  const adminBot = new TelegramBot(adminBotToken, { polling: false });

  adminBot.sendMessage(adminChatId, orderDetails);
}

// Aloqa ma'lumotlari
function showContact(chatId, language) {
  const contactInfo =
    language === "🇺🇿 O'zbek tili"
      ? "Biz bilan bog'lanish uchun:\nTelefon: +998974634455\nEmail: info@example.com"
      : "Для связи с нами:\nТелефон: +998974634455\nEmail: info@example.com";

  bot.sendMessage(chatId, contactInfo);
}

// Ijtimoiy tarmoqlar
function showSocialMedia(chatId, language) {
  const socialMedia =
    language === "🇺🇿 O'zbek tili"
      ? "Bizning ijtimoiy tarmoqlar:"
      : "Наши социальные сети:";

  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "📢 Telegram",
            url: "https://t.me/Sadikov001",
          },
        ],
        [
          {
            text: "📸 Instagram",
            url: "https://www.instagram.com/sad1kov_lv/",
          },
        ],
        [
          {
            text: "🌍 Web-sayt",
            url: "https://online-maktab.vercel.app/",
          },
        ]
        
      ],
    },
  };

  bot.sendMessage(chatId, socialMedia, options);
}








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
  productButtons.push([language === "🇺🇿 O'zbek tili" ? "🔙 Orqaga" : "🔙 Назад"]);

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

// O'z dizayningni yaratish
function showCreateDesign(chatId, language) {
  const designBotLink = "@yangidizayn1_bot"; // O'z dizayningni yaratish boti linki
  const message =
    language === "🇺🇿 O'zbek tili"
      ? `O'z dizayningni yaratish uchun quyidagi botga o'ting: ${designBotLink}`
      : `Перейдите в бота для создания своего дизайна: ${designBotLink}`;

  bot.sendMessage(chatId, message);
}



console.log("Bssssssdddddddddddsss");
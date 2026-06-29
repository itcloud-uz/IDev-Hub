import https from 'https';
import fs from 'fs';
import path from 'path';
import prisma from '../lib/prisma';
import { PaymentType } from '@prisma/client';

const CATEGORY_LABELS: Record<string, string> = {
  SERVER_TOOLS: 'Server vositalari',
  AI_BOTS: 'AI/Botlar',
  WEB_DEV: 'Web dasturlash',
  DEVOPS: 'DevOps',
  MOBILE_DEV: 'Mobil dasturlash',
};

const sessionFilePath = path.join(process.cwd(), 'telegram_sessions.json');

class TelegramBotService {
  private token: string;
  private offset: number = 0;
  private isRunning: boolean = false;
  private sessions: Record<number, { email: string; userId: string }> = {};

  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN || '8949540479:AAG82j7c1tIKMW2U9bautgbVtjUjZLnPWEI';
    this.token = this.token.replace(/['"]/g, '');
    this.loadSessions();
  }

  private loadSessions() {
    try {
      if (fs.existsSync(sessionFilePath)) {
        this.sessions = JSON.parse(fs.readFileSync(sessionFilePath, 'utf8'));
      }
    } catch (e) {
      console.error('Error loading Telegram sessions:', e);
      this.sessions = {};
    }
  }

  private saveSessions() {
    try {
      fs.writeFileSync(sessionFilePath, JSON.stringify(this.sessions, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving Telegram sessions:', e);
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('🤖 Telegram Support & Shop Bot starting...');
    this.poll();
  }

  private poll() {
    const url = `https://api.telegram.org/bot${this.token}/getUpdates?offset=${this.offset}&timeout=30`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.ok && response.result && response.result.length > 0) {
            for (const update of response.result) {
              this.offset = update.update_id + 1;
              if (update.message) {
                this.handleMessage(update.message).catch(err => {
                  console.error('Error handling Telegram message:', err);
                });
              } else if (update.callback_query) {
                this.handleCallbackQuery(update.callback_query).catch(err => {
                  console.error('Error handling Telegram callback query:', err);
                });
              }
            }
          }
        } catch (e) {
          // JSON Parse error
        }
        if (this.isRunning) {
          setTimeout(() => this.poll(), 1000);
        }
      });
    }).on('error', (err) => {
      console.error('Telegram polling connection error:', err.message);
      if (this.isRunning) {
        setTimeout(() => this.poll(), 5000);
      }
    });
  }

  private async handleMessage(message: any) {
    const chatId = message.chat.id;
    const text = (message.text || '').trim();

    if (!text) return;

    // Command handlers
    if (text === '/start') {
      await this.sendWelcomeMessage(chatId);
      return;
    }

    if (text === '🛍️ Mahsulotlar') {
      await this.sendProducts(chatId);
      return;
    }

    if (text === '🛒 Savatim') {
      await this.sendCart(chatId);
      return;
    }

    if (text === '🔍 Buyurtmalarim') {
      const session = this.sessions[chatId];
      if (!session) {
        this.sendMessage(chatId, `🔍 Buyurtmalarni tekshirish uchun iltimos avval profilingiz emailini yuboring (masalan: <code>user@idev-hub.com</code>).`);
      } else {
        await this.checkUserByEmail(chatId, session.email);
      }
      return;
    }

    if (text === '📞 Admin bilan bog\'lanish') {
      await this.sendSupportContact(chatId);
      return;
    }

    // Check if user entered an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(text)) {
      await this.linkProfileByEmail(chatId, text.toLowerCase());
      return;
    }

    // Default fallback
    await this.handleGeneralText(chatId, text);
  }

  private async handleCallbackQuery(query: any) {
    const queryId = query.id;
    const chatId = query.message.chat.id;
    const data = query.data;

    if (!data) return;

    const session = this.sessions[chatId];

    if (data.startsWith('add_to_cart:') || data.startsWith('buy_now:')) {
      if (!session) {
        this.answerCallbackQuery(queryId, '⚠️ Iltimos, oldin email manzilingizni yuborib botni profilingizga bog\'lang!', true);
        return;
      }
      
      const parts = data.split(':');
      const action = parts[0];
      const productId = parts[1];

      try {
        await prisma.cartItem.upsert({
          where: {
            userId_productId: {
              userId: session.userId,
              productId
            }
          },
          create: {
            userId: session.userId,
            productId
          },
          update: {}
        });

        this.answerCallbackQuery(queryId, '🛒 Mahsulot savatga qo\'shildi!');
        
        if (action === 'buy_now') {
          await this.sendCart(chatId);
        } else {
          this.sendMessage(chatId, `✅ Mahsulot savatingizga qo'shildi! Uni ko'rish va to'lov qilish uchun <b>"🛒 Savatim"</b> bo'limiga o'ting.`);
        }
      } catch (e) {
        this.answerCallbackQuery(queryId, '❌ Xatolik yuz berdi');
      }
      return;
    }

    if (data.startsWith('remove_from_cart:')) {
      if (!session) return;
      const cartItemId = data.split(':')[1];
      try {
        await prisma.cartItem.delete({
          where: { id: cartItemId }
        });
        this.answerCallbackQuery(queryId, '❌ Mahsulot savatdan o\'chirildi');
        await this.sendCart(chatId);
      } catch (e) {
        this.answerCallbackQuery(queryId, '❌ O\'chirib bo\'lmadi');
      }
      return;
    }

    if (data === 'clear_cart') {
      if (!session) return;
      try {
        await prisma.cartItem.deleteMany({
          where: { userId: session.userId }
        });
        this.answerCallbackQuery(queryId, '🗑️ Savat tozalandi');
        this.sendMessage(chatId, `Savatingiz tozalandi.`);
      } catch (e) {
        this.answerCallbackQuery(queryId, '❌ Xatolik yuz berdi');
      }
      return;
    }

    if (data === 'checkout') {
      if (!session) return;
      try {
        const cartItems = await prisma.cartItem.findMany({
          where: { userId: session.userId },
          include: { product: true }
        });

        if (cartItems.length === 0) {
          this.answerCallbackQuery(queryId, 'Savat bo\'sh');
          return;
        }

        const total = cartItems.reduce((sum, item) => sum + item.product.price, 0);
        this.answerCallbackQuery(queryId);

        let checkoutText = `💳 <b>Buyurtma rasmiylashtirish:</b>\n\n` +
          `Jami: ${cartItems.length} ta mahsulot\n` +
          `Summa: <b>${total.toLocaleString()} so'm</b>\n\n` +
          `Iltimos, to'lov tizimini tanlang:`;

        const inlineKeyboard = {
          inline_keyboard: [
            [
              { text: 'Click orqali to\'lov', callback_data: 'checkout_pay:CLICK' },
              { text: 'Paynet orqali to\'lov', callback_data: 'checkout_pay:PAYNET' }
            ]
          ]
        };

        this.sendMessage(chatId, checkoutText, { reply_markup: JSON.stringify(inlineKeyboard) });
      } catch (e) {
        this.answerCallbackQuery(queryId, '❌ Xatolik yuz berdi');
      }
      return;
    }

    if (data.startsWith('checkout_pay:')) {
      if (!session) return;
      const paymentType = data.split(':')[1];
      this.answerCallbackQuery(queryId, 'Buyurtma yaratilmoqda...');

      try {
        const cartItems = await prisma.cartItem.findMany({
          where: { userId: session.userId },
          include: { product: true }
        });

        if (cartItems.length === 0) {
          this.sendMessage(chatId, `❌ Savatingiz bo'sh. Qayta buyurtma berib bo'lmaydi.`);
          return;
        }

        const createdOrders = [];
        for (const item of cartItems) {
          const order = await prisma.order.create({
            data: {
              userId: session.userId,
              productId: item.productId,
              amount: item.product.price,
              paymentType: paymentType as PaymentType
            }
          });
          createdOrders.push(order);

          // Clear from cart
          await prisma.cartItem.deleteMany({
            where: { userId: session.userId, productId: item.productId }
          });
        }

        // Get payment instructions
        const method = await prisma.paymentMethod.findUnique({
          where: { name: paymentType }
        });

        const total = cartItems.reduce((sum, item) => sum + item.product.price, 0);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        let successText = `🎉 <b>Buyurtma muvaffaqiyatli yaratildi!</b>\n\n` +
          `💰 Jami to'lov: <b>${total.toLocaleString()} so'm</b>\n` +
          `To'lov usuli: <b>${paymentType}</b>\n\n` +
          `📝 <b>Yo'riqnoma:</b>\n${method?.instructions || 'Ko\'rsatilgan rekvizitlarga to\'lov qiling.'}\n\n` +
          `⚠️ <b>MUHIM QADAM:</b> To'lovni amalga oshirgach, to'lov chekini (skrinshot) yuklashingiz kerak. Buning uchun saytdagi kabinetingizga o'ting:\n` +
          `👉 <a href="${frontendUrl}/dashboard/orders">Buyurtmalarim sahifasiga o'tish</a>`;

        this.sendMessage(chatId, successText);
      } catch (e) {
        console.error('Telegram checkout error:', e);
        this.sendMessage(chatId, `❌ Buyurtma berishda xatolik yuz berdi.`);
      }
      return;
    }
  }

  private async sendWelcomeMessage(chatId: number) {
    const welcomeText = `👋 <b>iDev-Hub Tizim Yordamchisiga xush kelibsiz!</b>\n\n` +
      `Ushbu bot orqali siz:\n` +
      `🛍️ Mahsulotlarni ko'rishingiz\n` +
      `🛒 Savatingizni boshqarishingiz\n` +
      `💳 Buyurtmalar berib, kalitlarni tekshirishingiz mumkin.\n\n` +
      `⚙️ Platforma bilan to'liq sinxronlashish uchun ro'yxatdan o'tgan <b>Email manzilingizni</b> yuboring (masalan: <code>user@idev-hub.com</code>).`;

    const keyboard = {
      keyboard: [
        [{ text: '🛍️ Mahsulotlar' }, { text: '🛒 Savatim' }],
        [{ text: '🔍 Buyurtmalarim' }, { text: '📞 Admin bilan bog\'lanish' }]
      ],
      resize_keyboard: true
    };

    this.sendMessage(chatId, welcomeText, { reply_markup: JSON.stringify(keyboard) });
  }

  private async sendProducts(chatId: number) {
    try {
      const products = await prisma.product.findMany({ where: { active: true } });
      if (products.length === 0) {
        this.sendMessage(chatId, `😔 Hozirda sotuvda mahsulotlar mavjud emas.`);
        return;
      }

      this.sendMessage(chatId, `🛍️ <b>Mavjud premium mahsulotlar:</b>`);

      for (const product of products) {
        const productText = `📦 <b>${product.name}</b>\n` +
          `🏷️ Kategoriya: <i>${CATEGORY_LABELS[product.category] || product.category}</i>\n` +
          `💰 Narxi: <b>${product.price.toLocaleString()} so'm</b>\n` +
          `📝 <b>Tavsif:</b> ${product.description}`;

        const inlineKeyboard = {
          inline_keyboard: [
            [
              { text: '🛒 Savatga qo\'shish', callback_data: `add_to_cart:${product.id}` },
              { text: '⚡️ Hozir sotib olish', callback_data: `buy_now:${product.id}` }
            ]
          ]
        };

        this.sendMessage(chatId, productText, { reply_markup: JSON.stringify(inlineKeyboard) });
      }
    } catch (err) {
      this.sendMessage(chatId, `❌ Mahsulotlarni yuklashda xatolik yuz berdi.`);
    }
  }

  private async sendCart(chatId: number) {
    const session = this.sessions[chatId];
    if (!session) {
      this.sendMessage(chatId, `⚠️ Iltimos, oldin ro'yxatdan o'tgan email manzilingizni yuborib botni profilingizga bog'lang.`);
      return;
    }

    try {
      const cartItems = await prisma.cartItem.findMany({
        where: { userId: session.userId },
        include: { product: true }
      });

      if (cartItems.length === 0) {
        this.sendMessage(chatId, `🛒 <b>Sizning savatingiz bo'sh.</b>\n\nMahsulotlar qo'shish uchun <b>"🛍️ Mahsulotlar"</b> bo'limiga o'ting.`);
        return;
      }

      let cartText = `🛒 <b>Sizning savatingiz:</b>\n\n`;
      let total = 0;
      
      const inlineRows = [];

      for (const item of cartItems) {
        cartText += `🔹 <b>${item.product.name}</b> - ${item.product.price.toLocaleString()} so'm\n`;
        total += item.product.price;
        
        // Add delete button next to each item
        inlineRows.push([{ text: `❌ ${item.product.name} ni o'chirish`, callback_data: `remove_from_cart:${item.id}` }]);
      }

      cartText += `\n💰 Jami: <b>${total.toLocaleString()} so'm</b>`;

      inlineRows.push([
        { text: '🗑️ Savatni tozalash', callback_data: 'clear_cart' },
        { text: '💳 Sotib olish (Checkout)', callback_data: 'checkout' }
      ]);

      const inlineKeyboard = {
        inline_keyboard: inlineRows
      };

      this.sendMessage(chatId, cartText, { reply_markup: JSON.stringify(inlineKeyboard) });
    } catch (e) {
      this.sendMessage(chatId, `❌ Savat ma'lumotlarini yuklab bo'lmadi.`);
    }
  }

  private async linkProfileByEmail(chatId: number, email: string) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        this.sendMessage(chatId, `❌ Kechirasiz, <b>${email}</b> manzilli foydalanuvchi topilmadi. Iltimos, platformadagi email manzilingizni to'g'ri kiriting.`);
        return;
      }

      // Link session
      this.sessions[chatId] = { email: user.email, userId: user.id };
      this.saveSessions();

      let successText = `✅ <b>Profil muvaffaqiyatli bog'landi!</b>\n\n` +
        `👤 Foydalanuvchi: <b>${user.name}</b>\n` +
        `✉️ Email: <code>${user.email}</code>\n\n` +
        `Endi siz ushbu bot orqali savatingizni ko'rishingiz, mahsulotlar sotib olishingiz va buyurtmalar holatini tekshirishingiz mumkin.`;

      this.sendMessage(chatId, successText);
      await this.checkUserByEmail(chatId, email);
    } catch (e) {
      this.sendMessage(chatId, `❌ Profilni tekshirishda xatolik yuz berdi.`);
    }
  }

  private async sendSupportContact(chatId: number) {
    const contactText = `📞 <b>Texnik qo'llab-quvvatlash:</b>\n\n` +
      `Muammo yuzaga kelgan bo'lsa yoki savollaringiz bo'lsa admin bilan bog'laning:\n\n` +
      `✉️ Email: <b>support@idev-hub.com</b>\n` +
      `Telegram: @idev_support_admin\n` +
      `Ish vaqti: 24/7`;
    this.sendMessage(chatId, contactText);
  }

  private async checkUserByEmail(chatId: number, email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          orders: {
            include: {
              product: true,
              licenseKey: true
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (!user) return;

      let responseText = `🔍 <b>Xaridlar tarixi (Oxirgi 5 ta):</b>\n\n`;
      
      if (user.blocked) {
        responseText += `⚠️ <b>Hisobingiz bloklangan.</b> Iltimos, admin bilan bog'laning.`;
        this.sendMessage(chatId, responseText);
        return;
      }

      if (user.orders.length === 0) {
        responseText += `Sizda hali hech qanday xarid buyurtmasi mavjud emas.`;
        this.sendMessage(chatId, responseText);
        return;
      }

      this.sendMessage(chatId, responseText);

      for (const order of user.orders.slice(0, 5)) {
        let orderText = `📦 <b>Mahsulot:</b> ${order.product.name}\n` +
          `💰 Narxi: ${order.amount.toLocaleString()} so'm\n` +
          `📅 Sana: ${new Date(order.createdAt).toLocaleDateString()}\n`;

        if (order.status === 'PENDING') {
          orderText += `⏳ <b>Holat:</b> To'lov tekshirilmoqda\n\n` +
            `💡 <i>Eslatma:</i> To'lov skrinshotini (chek) yuklaganingizga ishonch hosil qiling. Admin tezda tasdiqlaydi.`;
        } else if (order.status === 'CONFIRMED') {
          const key = order.manualKey || order.licenseKey?.keyValue || 'Biriktirilmagan';
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          orderText += `✅ <b>Holat:</b> Tasdiqlangan\n` +
            `🔑 <b>Litsenziya kaliti:</b> <code>${key}</code>\n\n` +
            `💾 Dasturni yuklash uchun:\n` +
            `👉 <a href="${frontendUrl}/dashboard/orders">Shaxsiy kabinetga o'ting</a>`;
        } else {
          orderText += `❌ <b>Holat:</b> Bekor qilingan`;
        }

        this.sendMessage(chatId, orderText);
      }

    } catch (err) {
      console.error('Telegram checkUserByEmail error:', err);
    }
  }

  private async handleGeneralText(chatId: number, text: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(text)) {
      try {
        const order = await prisma.order.findUnique({
          where: { id: text },
          include: { product: true, licenseKey: true, user: true }
        });

        if (order) {
          let orderText = `🔍 <b>Buyurtma topildi!</b>\n\n` +
            `👤 Foydalanuvchi: ${order.user.name}\n` +
            `📦 Mahsulot: ${order.product.name}\n` +
            `💰 Narxi: ${order.amount.toLocaleString()} so'm\n`;

          if (order.status === 'PENDING') {
            orderText += `⏳ Holat: Kutilmoqda (to'lov tekshirilmoqda)`;
          } else if (order.status === 'CONFIRMED') {
            const key = order.manualKey || order.licenseKey?.keyValue || 'Biriktirilmagan';
            orderText += `✅ Holat: Tasdiqlangan\n` +
              `🔑 Kalit: <code>${key}</code>`;
          } else {
            orderText += `❌ Holat: Bekor qilingan`;
          }
          this.sendMessage(chatId, orderText);
          return;
        }
      } catch (e) {
        // catch
      }
    }

    const replyText = `🤖 <b>iDev-Hub Tizim Yordamchisi:</b>\n\n` +
      `Siz yuborgan buyruqni tushuna olmadim.\n\n` +
      `1️⃣ Agar profilni botga hali bog'lamagan bo'lsangiz, tizimga a'zo bo'lgan <b>Email manzilingizni</b> yozib yuboring.\n` +
      `2️⃣ Quyidagi klaviatura tugmalaridan foydalaning.`;
    this.sendMessage(chatId, replyText);
  }

  private answerCallbackQuery(callbackQueryId: string, text?: string, showAlert: boolean = false) {
    const url = `https://api.telegram.org/bot${this.token}/answerCallbackQuery`;
    const payload = JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
      show_alert: showAlert
    });

    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      res.resume();
    });
    req.on('error', () => {});
    req.write(payload);
    req.end();
  }

  private sendMessage(chatId: number, text: string, options: any = {}) {
    const url = `https://api.telegram.org/bot${this.token}/sendMessage`;
    const payload = JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...options
    });

    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      res.resume();
    });

    req.on('error', (e) => {
      console.error('Telegram sendMessage error:', e.message);
    });

    req.write(payload);
    req.end();
  }
}

export const telegramBotService = new TelegramBotService();

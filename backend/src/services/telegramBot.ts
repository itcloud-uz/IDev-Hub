import https from 'https';
import prisma from '../lib/prisma';

class TelegramBotService {
  private token: string;
  private offset: number = 0;
  private isRunning: boolean = false;

  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN || '8949540479:AAG82j7c1tIKMW2U9bautgbVtjUjZLnPWEI';
    // Clean potential quotes
    this.token = this.token.replace(/['"]/g, '');
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('🤖 Telegram Support Bot starting...');
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
              }
            }
          }
        } catch (e) {
          // JSON Parse error or similar
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

    // Handle slash commands or menu clicks
    if (text === '/start') {
      await this.sendWelcomeMessage(chatId);
      return;
    }

    if (text === '💳 To\'lov usullari') {
      await this.sendPaymentMethods(chatId);
      return;
    }

    if (text === '🚀 Sotib olish ko\'rsatmasi') {
      await this.sendPurchaseGuide(chatId);
      return;
    }

    if (text === '📞 Admin bilan bog\'lanish') {
      await this.sendSupportContact(chatId);
      return;
    }

    // Check if user entered an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(text)) {
      await this.checkUserByEmail(chatId, text.toLowerCase());
      return;
    }

    // Default fallback: assume they sent some text and help them
    await this.handleGeneralText(chatId, text);
  }

  private async sendWelcomeMessage(chatId: number) {
    const welcomeText = `👋 <b>iDev-Hub Yordam Botiga xush kelibsiz!</b>\n\n` +
      `Ushbu bot orqali siz iDev-Hub platformasidagi buyurtmalaringiz holatini bilishingiz, litsenziya kalitlarini olishingiz va yordam so'rashingiz mumkin.\n\n` +
      `🔍 Profilingizni aniqlashimiz uchun platformada ro'yxatdan o'tgan <b>Email manzilingizni</b> yuboring (masalan: <code>user@idev-hub.com</code>).`;

    const keyboard = {
      keyboard: [
        [{ text: '💳 To\'lov usullari' }, { text: '🚀 Sotib olish ko\'rsatmasi' }],
        [{ text: '📞 Admin bilan bog\'lanish' }]
      ],
      resize_keyboard: true
    };

    this.sendMessage(chatId, welcomeText, { reply_markup: JSON.stringify(keyboard) });
  }

  private async sendPaymentMethods(chatId: number) {
    try {
      const methods = await prisma.paymentMethod.findMany();
      if (methods.length === 0) {
        this.sendMessage(chatId, `ℹ️ <b>To'lov usullari:</b>\n\nHozirda platformada to'lov usullari sozlanmagan. Iltimos, keyinroq urinib ko'ring.`);
        return;
      }

      let responseText = `💳 <b>Mavjud to'lov usullari:</b>\n\n`;
      for (const method of methods) {
        responseText += `✅ <b>${method.name}</b>\n`;
        if (method.instructions) {
          responseText += `📝 Yo'riqnoma: ${method.instructions}\n`;
        }
        responseText += `\n`;
      }
      responseText += `To'lovni amalga oshirgach, chek skrinshotini platformadagi checkout sahifasida yuklashni unutmang.`;
      this.sendMessage(chatId, responseText);
    } catch (err) {
      this.sendMessage(chatId, `❌ Ma'lumotlarni yuklashda xatolik yuz berdi.`);
    }
  }

  private async sendPurchaseGuide(chatId: number) {
    const guideText = `🚀 <b>Sotib olish va kalitlarni olish bo'yicha ko'rsatma:</b>\n\n` +
      `1️⃣ <b>Katalog</b> bo'limidan o'zingizga kerakli dasturiy vositani tanlang.\n` +
      `2️⃣ Uni <b>Savatga</b> qo'shing va checkout sahifasiga o'ting.\n` +
      `3️⃣ Ko'rsatilgan Click yoki Paynet rekvizitlariga to'lov qiling.\n` +
      `4️⃣ To'lov skrinshotini (chek rasm) saytga yuklab <b>"To'ladim"</b> tugmasini bosing.\n` +
      `5️⃣ Admin tekshirgandan so'ng (odatda 5-15 daqiqa), profilingizda mahsulotni yuklab olish tugmasi va litsenziya kaliti paydo bo'ladi. Kalitni ushbu bot orqali ham olishingiz mumkin.`;
    this.sendMessage(chatId, guideText);
  }

  private async sendSupportContact(chatId: number) {
    const contactText = `📞 <b>Texnik qo'llab-quvvatlash:</b>\n\n` +
      `Agar buyurtmangiz tasdiqlanmasdan qolgan bo'lsa yoki savollaringiz bo'lsa, admin bilan bog'laning:\n\n` +
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

      if (!user) {
        this.sendMessage(chatId, `❌ Kechirasiz, <b>${email}</b> manzilli foydalanuvchi topilmadi. Iltimos, platformada ro'yxatdan o'tgan email manzilingizni to'g'ri kiriting.`);
        return;
      }

      let responseText = `👤 <b>Assalomu alaykum, ${user.name}!</b>\n\nProfilingiz aniqlandi.\n`;
      
      if (user.blocked) {
        responseText += `⚠️ <b>Hisobingiz bloklangan.</b> Iltimos, yordam olish uchun admin bilan bog'laning.`;
        this.sendMessage(chatId, responseText);
        return;
      }

      if (user.orders.length === 0) {
        responseText += `ℹ️ Sizda hali hech qanday xarid buyurtmasi mavjud emas. Mahsulotlarni sotib olish uchun saytga kiring.`;
        this.sendMessage(chatId, responseText);
        return;
      }

      responseText += `Quyida oxirgi xaridlaringiz holati:\n\n`;
      this.sendMessage(chatId, responseText);

      // Send each order as a separate structured message
      for (const order of user.orders.slice(0, 5)) {
        let orderText = `📦 <b>Mahsulot:</b> ${order.product.name}\n` +
          `💰 <b>Narxi:</b> ${order.amount.toLocaleString()} so'm\n` +
          `📅 <b>Sana:</b> ${new Date(order.createdAt).toLocaleDateString()}\n`;

        if (order.status === 'PENDING') {
          orderText += `⏳ <b>Holat:</b> To'lov tekshirilmoqda\n\n` +
            `💡 <i>Muammo bormi?</i> Agar to'lov qilgan bo'lsangiz va status o'zgarmasa, checkout sahifasida chek (skrinshot) yuklaganingizni tekshiring. Admin tez orada tasdiqlaydi.`;
        } else if (order.status === 'CONFIRMED') {
          const key = order.manualKey || order.licenseKey?.keyValue || 'Hali biriktirilmagan';
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
          orderText += `✅ <b>Holat:</b> To'lov tasdiqlangan\n` +
            `🔑 <b>Litsenziya kaliti:</b> <code>${key}</code>\n\n` +
            `💾 Dasturni yuklab olish uchun saytdagi kabinetingizga o'ting:\n` +
            `👉 <a href="${frontendUrl}/dashboard/orders">Shaxsiy kabinetga o'tish</a>`;
        } else {
          orderText += `❌ <b>Holat:</b> Bekor qilingan`;
        }

        this.sendMessage(chatId, orderText);
      }

    } catch (err) {
      console.error('Telegram checkUserByEmail error:', err);
      this.sendMessage(chatId, `❌ Tizimda xatolik yuz berdi. Iltimos, birozdan so'ng qayta urinib ko'ring.`);
    }
  }

  private async handleGeneralText(chatId: number, text: string) {
    // Try to see if it's an order ID (UUID format or similar)
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
        // Silently catch
      }
    }

    // Default reply
    const replyText = `🤖 <b>iDev-Hub Support AI:</b>\n\n` +
      `Siz yozgan matnni tushuna olmadim. Agar yordam kerak bo'lsa:\n\n` +
      `1️⃣ Platformada ro'yxatdan o'tgan <b>Email manzilingizni</b> yuboring. Men sizning profil va buyurtmalaringizni tekshirib beraman.\n` +
      `2️⃣ Quyidagi tugmalar orqali kerakli bo'limga o'ting.`;
    this.sendMessage(chatId, replyText);
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
      // Consume response
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

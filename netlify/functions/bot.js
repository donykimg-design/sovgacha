const TelegramBot = require('node-telegram-bot-api');
const token = '8872498465:AAHEeDVtSZ_1fxbb4b4snK_Ln_tq8nzcEpo';
const bot = new TelegramBot(token);

const CHANNELS = [
    { username: '@GlowRuzmatov', url: 'https://t.me/GlowRuzmatov', name: "1-Kanal" },
    { username: '@Sovgacha_official', url: 'https://t.me/Sovgacha_official', name: "2-Kanal" }
];

exports.handler = async (event) => {
    try {
        if (event.httpMethod !== 'POST') {
            return { statusCode: 200, body: 'Sovgacha Bot Webhook online!' };
        }
        const body = JSON.parse(event.body);

        if (body.message) {
            const msg = body.message;
            const chatId = msg.chat.id;

            if (msg.text === '/start') {
                const firstName = msg.from.first_name || '';
                const inline_keyboard = CHANNELS.map(ch => [{ text: `📣 ${ch.name}ga a'zo bo'lish`, url: ch.url }]);
                inline_keyboard.push([{ text: "✅ Tasdiqlash", callback_data: "check_sub" }]);

                await bot.sendMessage(
                    chatId, 
                    `Assalomu alaykum <b>${firstName}</b>! 👋\n\nBizning <b>Mini App</b> xizmatimizdan foydalanish uchun quyidagi qoidalarga amal qilishingiz kerak:\n\nPastdagi ikkala kanalga to'liq a'zo bo'lib, so'ngra "Tasdiqlash" tugmasini bosing.`, 
                    { parse_mode: 'HTML', reply_markup: { inline_keyboard } }
                );
            } else if (msg.photo) {
                await bot.sendMessage(
                    chatId, 
                    "✅ <b>To'lov kvitansiyasi (chek) qabul qilindi.</b> \n\nAdmin tekshirgach, xizmatingiz tasdiqlanadi. Iltimos kuting!", 
                    { parse_mode: 'HTML' }
                );
            } else if (msg.text) {
                if (msg.text.includes("Men to'lov qildim") || msg.text.includes("haqiqiy botingiz") || msg.text.includes("qildim")) {
                    const invoiceText = `💌 <b>VIP SOVG'A BUYURTMASI (ID: #${Math.floor(Math.random() * 90000) + 10000})</b>\n\n🎀 <b>Xizmat:</b> Maxsus VIP Havola (Reklamasiz, Sof)\n💝 <b>To'lov summasi:</b> 19,990 UZS\n\n💳 <b>Karta (Humo):</b>\n<code>9860 0609 2112 2507</code> <i>(D.R)</i>\n\n⚠️ <i>Diqqat: Havolangiz bazada tayyorlandi. Uni qulfdan chiqarish uchun to'lovni amalga oshiring va chek rasmini (kvitansiyani) to'g'ridan-to'g'ri shu yerga yuboring!</i> ✨`;
                    await bot.sendMessage(chatId, invoiceText, { parse_mode: 'HTML' });
                } else {
                    await bot.sendMessage(chatId, "Iltimos, Mini App ga kirish uchun majburiy obunalarni bajaring yoki to'lov qilgan bo'lsangiz kvitansiya (rasm) yuboring.");
                }
            }
        }

        if (body.callback_query) {
            const query = body.callback_query;
            const chatId = query.message.chat.id;
            const userId = query.from.id;

            if (query.data === 'check_sub') {
                let allSubscribed = true;
                for (let ch of CHANNELS) {
                    try {
                        const chatMember = await bot.getChatMember(ch.username, userId);
                        const status = chatMember.status;
                        if (!['creator', 'administrator', 'member'].includes(status)) {
                            allSubscribed = false;
                            break;
                        }
                    } catch (e) {
                         await bot.answerCallbackQuery(query.id, { text: `⚠️ Xatolik: Bot ${ch.username} kanaliga admin qilinmagan! Uni darhol admin qiling.`, show_alert: true });
                         return { statusCode: 200, body: 'ok' };
                    }
                }
                if (allSubscribed) {
                    await bot.deleteMessage(chatId, query.message.message_id).catch(() => {});
                    const webAppOpts = {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "✨ Sovg'ani Yaratish (Mini App) ✨", web_app: { url: "https://sovgacha.online" } }]
                            ]
                        }
                    };
                    await bot.sendMessage(
                        chatId, 
                        `🎉 <b>Qoyil, siz hamma kanallarga ulandingiz!</b>\n\nQulf ochildi. Endi oynagadan chiqmagan holda quyidagi tugma orqali mutlaqo yopiq <b>Mini App</b> darchasiga kirib, o'z mo'jizangizni yarating.\n\nG'oyalar tayyor bo'lgach esa menga shu botga chekni rasmini yuboring! 👇`, 
                        webAppOpts
                    );
                } else {
                    await bot.answerCallbackQuery(query.id, { text: "⛔️ Kechirasiz, siz hali ikkala kanalga ham to'liq obuna bo'lmadingiz! Iltimos, tekshirib qaytadan bosing.", show_alert: true });
                }
            }
        }
        return { statusCode: 200, body: 'ok' };
    } catch (error) {
        return { statusCode: 200, body: 'error' }; 
    }
};

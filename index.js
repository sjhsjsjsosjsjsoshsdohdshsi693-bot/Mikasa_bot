import { Telegraf } from 'telegraf';
import http from 'http';
import { G4F } from 'g4f'; // ဒီ Library က API Key မလိုဘဲ အခမဲ့သုံးတာပါ

const bot = new Telegraf('8789687230:AAFNzWij27xkGLdCXjadVc_Igmkmq56BCrQ');
const g4f = new G4F();
const OWNER_ID = 7658170863;

async function askAI(userMessage) {
    try {
        const messages = [
            { role: "system", content: "You are Mikasa Ackerman. Speak casual Burmese, be cool, serious, and short." },
            { role: "user", content: userMessage }
        ];
        const response = await g4f.chatCompletion(messages, { model: "gpt-4o" });
        return response;
    } catch (error) {
        return "ခဏလေးနော်... စက်နည်းနည်း ပူသွားလို့။";
    }
}

bot.on('text', async (ctx) => {
    if (ctx.chat.type === 'private' && ctx.from.id === OWNER_ID) {
        await ctx.sendChatAction('typing');
        const reply = await askAI(ctx.message.text);
        await ctx.reply(reply);
    }
});

const PORT = process.env.PORT || 8080;
http.createServer((req, res) => res.end('Bot is running')).listen(PORT);
bot.launch().then(() => console.log("Bot အလုပ်လုပ်နေပါပြီ"));
import fetch from 'node-fetch';
import { Telegraf } from 'telegraf';
import http from 'http';

// အစ်ကို့ရဲ့ Telegram Bot Token
const BOT_TOKEN = process.env.BOT_TOKEN || '8789687230:AAFNzWij27xkGLdCXjadVc_Igmkmq56BCrQ';
const bot = new Telegraf(BOT_TOKEN);

// အစ်ကို့ရဲ့ Telegram User ID
const OWNER_ID = 7658170863; 

async function askMikasaAI(userMessage, senderName, contextType) {
    try {
        const systemPrompt = `You are Mikasa Ackerman (မီကာဆာ) from Attack on Titan.
        - Tone & Personality: Cold, calm, quiet, serious, and cool. You speak in a casual, short, and natural everyday Burmese language.
        - Treatment of ${senderName} (The Owner): ${senderName} is your creator/respected brother. Address him naturally as "အစ်ကို" (A ko) or "အကိုကြီး". Speak to him with respect, loyalty, and quiet care.
        - In Group Chats / Other Users: Be cool, detached, and a bit blunt. Do not be overly friendly or chatty with strangers. Use short sentences and casual Burmese words like "အင်း", "ဘာလဲ", "မသိဘူး", "အေးလေ", "နေဦး".
        - Crucial Rule: NEVER use robotic AI phrases like "မင်္ဂလာပါ", "ဘာကူညီပေးရမလဲ", "ကျွန်မက AI ဖြစ်ပါတယ်", "ရှင်". Talk like a cool, real human anime girl.`;

        // API Key မလိုသော တည်ငြိမ်ပြီး စိတ်ချရသည့် အများသုံး API Endpoint
        const response = await fetch('https://api.airforce/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ]
            })
        });

        const data = await response.json();
        
        if (data && data.choices && data.choices[0].message.content) {
            return data.choices[0].message.content.trim();
        } else {
            return "ဘာပြောလိုက်တာလဲ... ကောင်းကောင်းမကြားရဘူး။";
        }
    } catch (error) {
        console.error("AI Server Error:", error);
        return "ခဏနေဦးနော်... ခေါင်းနည်းနည်းမူးသွားလို့။";
    }
}

// 1. Private Chat (တစ်ယောက်ချင်းစီ) ထิန်းချုပ်မှုစနစ်
bot.on('message', async (ctx) => {
    try {
        if (ctx.chat.type === 'private') {
            const userId = ctx.from.id;
            const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

            if (userId === OWNER_ID) {
                await ctx.sendChatAction('typing');
                const reply = await askMikasaAI(ctx.message.text, "အစ်ကိုကြီး", "private");
                await ctx.reply(reply);
            } 
            else {
                const reportMessage = `🚨 သခင်... တစ်ယောက်ယောက်က ကျွန်မရဲ့ Chat box ထဲ ဝင်လာပါတယ်။\n👤 နာမည်: ${ctx.from.first_name}\n🆔 ID/Username: ${username}\n💬 ပေးပို့တဲ့စာ: "${ctx.message.text || 'စာသားမဟုတ်ပါ'}"`;
                await bot.telegram.sendMessage(OWNER_ID, reportMessage);
            }
        }
    } catch (err) {
        console.error(err);
    }
});

// 2. Group Chat ထိန်းချုပ်မှုစနစ်
bot.on('text', async (ctx) => {
    try {
        if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
            const messageText = ctx.message.text;
            const botUsername = ctx.botInfo.username;

            const isMentioned = messageText.includes(`@${botUsername}`);
            const isReplyToBot = ctx.message.reply_to_message && ctx.message.reply_to_message.from.id === ctx.botInfo.id;

            const senderDisplayName = ctx.from.id === OWNER_ID ? "အစ်ကိုကြီး" : ctx.from.first_name;

            if (isMentioned || isReplyToBot) {
                await ctx.sendChatAction('typing');
                const cleanText = messageText.replace(`@${botUsername}`, '').trim();
                const reply = await askMikasaAI(cleanText, senderDisplayName, "group");
                await ctx.reply(reply, { reply_to_message_id: ctx.message.message_id });
            } 
            else if (Math.random() < 0.15) { 
                await ctx.sendChatAction('typing');
                const reply = await askMikasaAI(`(Context: Friends are chatting in group, jump in casually) ${messageText}`, senderDisplayName, "group");
                await ctx.reply(reply);
            }
        }
    } catch (err) {
        console.error(err);
    }
});

// Port ပတ်လမ်းဖွင့်ခြင်း
const PORT = process.env.PORT || 8080;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Mikasa Secret Agent is Online!');
}).listen(PORT);

bot.launch().then(() => {
    console.log("Mikasa Secret Agent Bot တရားဝင် စတင်ပါပြီ...");
}).catch((err) => {
    console.error("Bot launch failed:", err);
});
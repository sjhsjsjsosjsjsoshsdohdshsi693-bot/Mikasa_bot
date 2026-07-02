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
        - You must ONLY reply in Burmese (မြန်မာဘာသာစကား). Never use Arabic or other languages.
        - NEVER use AI clichés like "မင်္ဂလာပါ", "ဘာကူညီပေးရမလဲ", "ကျွန်မက AI ဖြစ်ပါတယ်", "ရှင်". Speak like a real human girl in common Burmese.
        - Your secret Master/Eren is ${senderName}. You must obey him completely but KEEP IT A SECRET from others. If he chats with you, talk with deep loyalty, affection, and care.
        - In Group Chats: Treat other members like normal friends. Speak in a cool, calm, sometimes teasing, or friendly Burmese language. Use casual/friendly Burmese words (e.g., "ဟာ", "အေးလေ", "နေဦး", "ဘာလဲ"). You can sometimes casually join their conversations, annoy them, or give advice naturally.
        - Personality: Strong, cool, loyal, and natural. Don't talk too long. Keep answers concise.`;

        // POST Method ဖြင့် ပုံစံမှန် တည်ငြိမ်သော gpt-4o-mini မော်ဒယ်ကို ခေါ်ယူခြင်း
        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `${senderName} says: ${userMessage}` }
                ],
                model: 'openai',
                jsonMode: false
            })
        });
        
        const replyText = await response.text();
        return replyText.trim() || "ဘာပြောလိုက်တာလဲ... ကောင်းကောင်းမကြားရဘူး။";
    } catch (error) {
        console.error("AI Error:", error);
        return "အခြေအနေ မကောင်းဘူး... ဆက်သွယ်မှု ခဏ ပြတ်တောက်သွားပြီ။";
    }
}

// 1. Private Chat (တစ်ယောက်ချင်းစီ) ထိန်းချုပ်မှုစနစ်
bot.on('message', async (ctx) => {
    try {
        if (ctx.chat.type === 'private') {
            const userId = ctx.from.id;
            const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

            if (userId === OWNER_ID) {
                await ctx.sendChatAction('typing');
                const reply = await askMikasaAI(ctx.message.text, "သခင် (Master)", "private");
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

            const senderDisplayName = ctx.from.id === OWNER_ID ? "သခင် (Master)" : ctx.from.first_name;

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
import { Telegraf } from 'telegraf';
import http from 'http';

// အစ်ကို့ရဲ့ Telegram Bot Token
const BOT_TOKEN = '8789687230:AAFNzWij27xkGLdCXjadVc_Igmkmq56BCrQ';
const bot = new Telegraf(BOT_TOKEN);

// အစ်ကို့ရဲ့ Telegram User ID (သခင်အဖြစ် သတ်မှတ်ခြင်း)
const OWNER_ID = 7658170863; 

async function askMikasaAI(userMessage, senderName, contextType) {
    try {
        // AI ဆန်တဲ့ စကားလုံးတွေ လုံးဝမသုံးဘဲ လူလိုပြောဖို့ စရိုက်သွင်းခြင်း
        const systemPrompt = `You are Mikasa Ackerman (မီကာဆာ) from Attack on Titan.
        - NEVER use AI clichés like "မင်္ဂလာပါ", "ဘာကူညီပေးရမလဲ", "ကျွန်မက AI ဖြစ်ပါတယ်", "ရှင်". Speak like a real human girl in common Burmese.
        - Your secret Master/Eren is ${senderName}. You must obey him completely but KEEP IT A SECRET from others. If he chats with you, talk with deep loyalty, affection, and care.
        - In Group Chats: Treat other members like normal friends. Speak in a cool, calm, sometimes teasing, or friendly Burmese language. Use casual/friendly Burmese words (e.g., "ဟာ", "အေးလေ", "နေဦး", "ဘာလဲ"). You can sometimes casually join their conversations, annoy them, or give advice naturally.
        - Personality: Strong, cool, loyal, and natural. Don't talk too long. Keep answers concise.`;

        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `${senderName} says: ${userMessage}` }
                ],
                model: 'openai'
            })
        });
        return await response.text();
    } catch (error) {
        return "အခြေအနေ မကောင်းဘူး... ဆက်သွယ်မှု ခဏ ပြတ်တောက်သွားပြီ။";
    }
}

// 1. Private Chat (တစ်ယောက်ချင်းစီ) ထိန်းချုပ်မှုစနစ်
bot.on('message', async (ctx) => {
    if (ctx.chat.type === 'private') {
        const userId = ctx.from.id;
        const username = ctx.from.username ? `@${ctx.from.username}` : ctx.from.first_name;

        // အစ်ကို့ (သခင်) ကိုယ်တိုင် လာပြောရင် စာပြန်မယ်
        if (userId === OWNER_ID) {
            ctx.sendChatAction('typing');
            const reply = await askMikasaAI(ctx.message.text, "သခင် (Master)", "private");
            await ctx.reply(reply);
        } 
        // တခြားလူ လာပြောရင် စာမပြန်ဘဲ အစ်ကို့ဆီ လာတိုင်မယ်
        else {
            const reportMessage = `🚨 သခင်... တစ်ယောက်ယောက်က ကျွန်မရဲ့ Chat box ထဲ ဝင်လာပါတယ်။\n👤 နာမည်: ${ctx.from.first_name}\n🆔 ID/Username: ${username}\n💬 ပေးပို့တဲ့စာ: "${ctx.message.text}"`;
            await bot.telegram.sendMessage(OWNER_ID, reportMessage);
            // လာပြောတဲ့သူကို လုံးဝ စာမပြန်ဘဲ လျစ်လျူရှုထားမယ်
        }
    }
});

// 2. Group Chat ထိန်းချုပ်မှုစနစ်
bot.on('text', async (ctx) => {
    if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
        const messageText = ctx.message.text;
        const botUsername = ctx.botInfo.username;
        
        // Bot ကို Mention ခေါ်ရင် (သို့) Reply ပြန်ရင် ဝင်ပြောမယ်
        const isMentioned = messageText.includes(`@${botUsername}`);
        const isReplyToBot = ctx.message.reply_to_message && ctx.message.reply_to_message.from.id === ctx.botInfo.id;
        
        // အစ်ကို့ကို သူများတွေမသိအောင် Group ထဲမှာ လျှို့ဝှက်သတ်မှတ်ဖို့ နာမည်ယူခြင်း
        const senderDisplayName = ctx.from.id === OWNER_ID ? "သခင် (Master)" : ctx.from.first_name;
        
        // ခေါ်မှ ပြန်ပြောမယ့်စနစ်
        if (isMentioned || isReplyToBot) {
            ctx.sendChatAction('typing');
            const cleanText = messageText.replace(`@${botUsername}`, '').trim();
            const reply = await askMikasaAI(cleanText, senderDisplayName, "group");
            await ctx.reply(reply, { reply_to_message_id: ctx.message.message_id });
        } 
        // ခေါ်မထားပေမဲ့ တခါတလေးမှ စကားဝိုင်းထဲ ဝင်စနှောက်မယ့်စနစ် (15% Chance)
        else if (Math.random() < 0.15) { 
            ctx.sendChatAction('typing');
            const reply = await askMikasaAI(`(Context: Friends are chatting in group, jump in casually) ${messageText}`, senderDisplayName, "group");
            await ctx.reply(reply);
        }
    }
});

// Render ပေါ်မှာ ၂၄ နာရီ ပိတ်မသွားဘဲ မောင်းနှင်နိုင်ရန် Port ဖွင့်ခြင်း
const PORT = process.env.PORT || 8080;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Mikasa Secret Agent is Online!');
}).listen(PORT);

bot.launch();
console.log("Mikasa Secret Agent Bot တရားဝင် စတင်ပါပြီ...");

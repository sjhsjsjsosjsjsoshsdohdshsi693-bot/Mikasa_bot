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

        // ပိုမိုတည်ငြိမ်ပြီး မြန်ဆန်သော အခမဲ့ API စနစ်သို့ ပြောင်းလဲခြင်း
        const response = await fetch('https://chateverywhere.onrender.com/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "gpt-4o-mini",
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
        console.error("AI Error:", error);
        return "ခဏနေဦးနော်... မီကာဆာ အလုပ်ရှုပ်နေလို့ ခဏနေမှ ပြန်ပြောမယ်။";
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
                const reply = await askMikasaAI(ctx.message.text, "အစ်ကိုကြီး", "private");
                await ctx.reply(reply);
            } 
            else {
                const reportMessage = `🚨 သခင်... တစ်ယောက်ယောက်က ကျွန်မရဲ့ Chat box ထဲ ဝင်လာပါတယ်။\n👤 နာမည်: ${ctx.from.first
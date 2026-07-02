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

        // စနစ်ကျပြီး ပုံစံမှန်ကန်သော အခမဲ့ API Endpoint
        const response = await fetch('https://api.airforce/v1/chat/completions', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer Missing-Token' // Airforce အတွက် မဖြစ်မနေလိုအပ်သော format
            },
            body: JSON.stringify({
                model: "gpt-4o", // တည်ငြိမ်ပြီး စာပြန်နှုန်းကောင်းသော မော်ဒယ်
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.7
            })
        });

        // Response အခြေအနေကို စစ်ဆေးခြင်း
        if (!response.ok) {
            return "ခဏနေဦး... လိုင်းသိပ်မကောင်းလို့ ထင်တယ်။";
        }

        const data = await response.json();
        
        if (data && data.choices && data.choices[0] && data.choices
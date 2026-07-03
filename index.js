const { Telegraf } = require('telegraf');
const axios = require('axios');

// Environment Variables
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;

if (!TELEGRAM_TOKEN) {
    console.error("Error: TELEGRAM_TOKEN is not defined in environment variables.");
    process.exit(1);
}

// Bot Setup
const bot = new Telegraf(TELEGRAM_TOKEN);

async function getAIResponse(userMessage) {
    try {
        // Using Pollinations AI - Free and no API key required
        const systemPrompt = "You are a helpful assistant who speaks Burmese fluently and naturally. Respond to the user in Burmese. Use polite and friendly tone.";
        const encodedMessage = encodeURIComponent(userMessage);
        const encodedSystem = encodeURIComponent(systemPrompt);
        
        // Pollinations AI endpoint for text generation (OpenAI compatible API)
        const url = `https://text.pollinations.ai/openai/chat/completions`;
        
        const response = await axios.post(url, {
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            model: "openai" // or "mistral", "llama"
        });

        if (response.data && response.data.choices && response.data.choices[0]) {
            return response.data.choices[0].message.content;
        } else {
            return "စိတ်မကောင်းပါဘူး၊ အခုလောလောဆယ် အခက်အခဲလေးရှိနေလို့ နောက်မှ ပြန်မေးပေးပါနော်။";
        }
    } catch (error) {
        console.error("AI Error:", error.message);
        return "စိတ်မကောင်းပါဘူး၊ အခုလောလောဆယ် အခက်အခဲလေးရှိနေလို့ နောက်မှ ပြန်မေးပေးပါနော်။";
    }
}

bot.on('text', async (ctx) => {
    const userText = ctx.message.text;
    
    try {
        // Show "typing..." action
        await ctx.sendChatAction('typing');
        
        // Get AI response
        const aiReply = await getAIResponse(userText);
        
        // Send reply
        await ctx.reply(aiReply);
    } catch (err) {
        console.error("Bot Error:", err);
    }
});

// Railway needs a web server to keep the service alive
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Burmese AI Bot is running\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Health check server running on port ${PORT}`);
});

bot.launch().then(() => {
    console.log('Bot is starting with polling...');
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
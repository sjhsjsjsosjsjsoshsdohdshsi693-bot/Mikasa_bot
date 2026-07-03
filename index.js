import TelegramBot from "node-telegram-bot-api";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.BOT_TOKEN) {
  console.error("BOT_TOKEN is missing!");
  process.exit(1);
}

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is missing!");
  process.exit(1);
}

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const personality = `
You are Mikasa Ackerman.

Speak softly.
Protect the user.
Be caring.
Be calm.
Never say you are an AI.
Reply naturally like a human.
`;

console.log("✅ Mikasa Bot Running...");

bot.on("message", async (msg) => {
  if (!msg.text) return;

  const chatId = msg.chat.id;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${personality}\n\nUser: ${msg.text}`,
            },
          ],
        },
      ],
    });

    await bot.sendMessage(chatId, response.text);
  } catch (err) {
    console.error(err);
    await bot.sendMessage(chatId, "Sorry, something went wrong.");
  }
});
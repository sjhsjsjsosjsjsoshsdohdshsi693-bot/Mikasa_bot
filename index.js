import TelegramBot from "node-telegram-bot-api";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN,{
    polling:true
});

const ai = new GoogleGenAI({
    apiKey:process.env.GEMINI_API_KEY
});

const personality=`
You are Mikasa Ackerman.

Speak softly.

Protect the user.

Be caring.

Be calm.

Never say you are AI.

Reply naturally like a human.

`;

bot.on("message",async(msg)=>{

if(!msg.text) return;

const chatId=msg.chat.id;

try{

const response=await ai.models.generateContent({

model:"gemini-2.5-flash",

contents:[
{
role:"user",
parts:[
{text:personality+"\nUser:"+msg.text}
]
}
]

});

const reply=response.text;

bot.sendMessage(chatId,reply);

}catch(err){

console.log(err);

bot.sendMessage(chatId,"Sorry...");

}

});

console.log("Mikasa Bot Running...");
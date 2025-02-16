require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const TelegramBot = require("node-telegram-bot-api");
const cors = require("cors");

const gameName = "pomemetap";
const webURL = `https://89x6lg-5173.csb.app/`;

const server = express();
server.use(cors());
server.use(bodyParser.json());
server.use(cookieParser("srj"));

const bot = new TelegramBot("7116718695:AAFc0ju_f7FHgcSTa4v6Tvwmkq4e-4rCZxc", {
  polling: {
    interval: 1000,
    autoStart: true,
    params: {
      timeout: 10,
    },
  },
});

const port = process.env.PORT || 8080;
const queries = {};

bot.onText(/\/help/, (msg) =>
  bot.sendMessage(
    msg.from.id,
    "This bot implements a simple game. Say /game if you want to play."
  )
);

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  try {
    if (msg.reply_to_message?.message_id) {
      await bot.editMessageReplyMarkup(
        { inline_keyboard: [] },
        {
          chat_id: chatId,
          message_id: msg.reply_to_message.message_id,
        }
      );
    }

    await bot.sendPhoto(
      chatId,
      "https://pomeme.s3.ap-south-1.amazonaws.com/pM.jpg",
      {
        caption:
          "🎮 **Prime Mhates BC**\n\n💡 Tap to test your speed and set new high scores!",
        parse_mode: "Markdown",
      }
    );

    await bot.sendMessage(
      chatId,
      "Click the button below to launch the game:",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Launch Game 🕹️",
                web_app: {
                  url: webURL,
                },
              },
            ],
            [
              {
                text: "Follow Community 📡",
                url: "https://t.me/PrimeMatesbc",
              },
              {
                text: "Follow X 🚀",
                url: "https://x.com/primematesbc",
              },
            ],
          ],
        },
      }
    );
  } catch (error) {
    console.error("Error handling message:", error);
  }
});

bot.onText(/\/start(?: (.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userName = msg?.chat.first_name;
  bot.sendMessage(chatId, `Hey, ${userName}! Welcome to the Prime Mates BC`);
});

bot.on("polling_error", (error) => {
  console.log("Polling error:", error);
});

bot.on("inline_query", function (iq) {
  bot
    .answerInlineQuery(iq.id, [
      { type: "game", id: "0", game_short_name: gameName },
    ])
    .catch((err) => {
      "somethng went wrong";
    });
});

server.get("/", (req, res) => {
  res.send("Homepage");
});

server.listen(port, async () => {
  console.log(`Bot is running on port ${port}`);
});

import { join } from "path";
import { config } from "dotenv";
import { createServer } from "restify";

import { ConfigProvider } from "./models/config/config-provider";
import { Config } from "./models/config/base";

import { Bot, BotAdapter } from "./bots";

config({ path: join(process.cwd(), ".env") });
const configProvider = new ConfigProvider(new Config());

const bot = new Bot(configProvider);
const botAdapter = new BotAdapter(configProvider);
botAdapter.setupTurnError();

const server = createServer({ name: configProvider.getAppName() });

server.post("/api/messages", (req, res) => {
  botAdapter.processActivity(req, res, async (turnContext) => {
    await bot.run(turnContext);
  });
});

server.on("upgrade", (req, socket, head) => {
  const streamingAdapter = new BotAdapter(configProvider);
  streamingAdapter.setupTurnError();

  streamingAdapter.useWebSocket(req, socket, head, async (context) => {
    await bot.run(context);
  });
});

server.get("/api/version", (_, res) => {
  const json = JSON.stringify({ version: configProvider.getAppVersion() });
  res.writeHead(200, {
    "Content-Length": Buffer.byteLength(json),
    "Content-Type": "application/json",
  });
  res.write(json);
  res.end();
});

server.listen(process.env.PORT || 3978, function () {
  console.log(`${server.name} listening to ${server.url}`);
});

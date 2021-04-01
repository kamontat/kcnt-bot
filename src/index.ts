import { join } from "path";
import { config } from "dotenv";
import { createServer } from "restify";
import {
  BotFrameworkAdapter,
  ConversationState,
  InputHints,
  MemoryStorage,
  UserState,
} from "botbuilder";

import { ConfigProvider } from "./models/config/config-provider";
import { Config } from "./models/config/base";

import { FlightBookingRecognizer } from "./dialogs/flight-recognizer";

import { DialogAndWelcomeBot } from "./bots/welcome";

import { name } from "../package.json";
import { MainDialog } from "./dialogs/main";
import { BookingDialog } from "./dialogs/booking";

config({ path: join(process.cwd(), ".env") });
const configProvider = new ConfigProvider(new Config());

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about adapters.
const adapter = new BotFrameworkAdapter(configProvider.getAdapterSetting());
adapter.onTurnError = async (context, error) => {
  // This check writes out errors to console log .vs. app insights.
  // NOTE: In production environment, you should consider logging this to Azure
  //       application insights. See https://aka.ms/bottelemetry for telemetry
  //       configuration instructions.
  console.error(`\n [onTurnError] unhandled error: ${error}`);

  // Send a trace activity, which will be displayed in Bot Framework Emulator
  await context.sendTraceActivity(
    "OnTurnError Trace",
    `${error}`,
    "https://www.botframework.com/schemas/error",
    "TurnError"
  );

  // Send a message to the user
  let onTurnErrorMessage = "The bot encountered an error or bug.";
  await context.sendActivity(
    onTurnErrorMessage,
    onTurnErrorMessage,
    InputHints.ExpectingInput
  );
  onTurnErrorMessage =
    "To continue to run this bot, please fix the bot source code.";
  await context.sendActivity(
    onTurnErrorMessage,
    onTurnErrorMessage,
    InputHints.ExpectingInput
  );
  // Clear out state
  await conversationState.delete(context);
};

// Define a state store for your bot. See https://aka.ms/about-bot-state to learn more about using MemoryStorage.
// A bot requires a state store to persist the dialog and user state between messages.

// For local development, in-memory storage is used.
// CAUTION: The Memory Storage used here is for local bot debugging only. When the bot
// is restarted, anything stored in memory will be gone.
const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

const luisRecognizer = new FlightBookingRecognizer(
  configProvider.getLuisSetting()
);

// Create the main dialog.
const bookingDialog = new BookingDialog("bookingDialog");
const dialog = new MainDialog(luisRecognizer, bookingDialog);
const bot = new DialogAndWelcomeBot(conversationState, userState, dialog);

const server = createServer({ name });

// Listen for incoming activities and route them to your bot main dialog.
server.post("/api/messages", (req, res) => {
  // Route received a request to adapter for processing
  adapter.processActivity(req, res, async (turnContext) => {
    // route to bot activity handler.
    await bot.run(turnContext);
  });
});

// Listen for Upgrade requests for Streaming.
server.on("upgrade", (req, socket, head) => {
  // Create an adapter scoped to this WebSocket connection to allow storing session data.
  const streamingAdapter = new BotFrameworkAdapter(
    configProvider.getAdapterSetting()
  );

  // Set onTurnError for the BotFrameworkAdapter created for each connection.
  // streamingAdapter.onTurnError = onTurnErrorHandler;

  streamingAdapter.useWebSocket(req, socket, head, async (context) => {
    // After connecting via WebSocket, run this logic for every request sent over
    // the WebSocket connection.
    await bot.run(context);
  });
});

server.listen(process.env.PORT || 3978, function () {
  console.log(`${server.name} listening to ${server.url}`);
});

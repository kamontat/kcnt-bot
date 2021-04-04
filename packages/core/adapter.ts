import { BotFrameworkAdapter, InputHints, TurnContext } from "botbuilder";
import { ConfigProvider } from "../models/config/config-provider";

// See https://aka.ms/about-bot-adapter to learn more about adapters.
export class BotAdapter extends BotFrameworkAdapter {
  constructor(private config: ConfigProvider) {
    super(config.getAdapterSetting());
  }

  setupTurnError(): void {
    this.onTurnError = this.onTurnErrorHandler.bind(this);
  }

  private async onTurnErrorHandler(
    context: TurnContext,
    error: Error
  ): Promise<void> {
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
    await this.config.getConversationState().delete(context);
  }
}

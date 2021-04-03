import { ActivityHandler, TurnContext } from "botbuilder-core";

import { BookingDialog } from "@kcnt-bot/dialog/booking";
import { MainDialog } from "@kcnt-bot/dialog/main";
import { FlightBookingRecognizer } from "@kcnt-bot/recognizer/flight-recognizer";
import { ConfigProvider } from "@kcnt-bot/models/config/config-provider";

import { DialogAndWelcomeBot } from "./models/welcome";

export class Bot {
  private recognizer: FlightBookingRecognizer;
  private bot: ActivityHandler;

  constructor(config: ConfigProvider) {
    this.recognizer = new FlightBookingRecognizer(config.getLuisSetting());

    const bookingDialog = new BookingDialog("bookingDialog");
    const dialog = new MainDialog(this.recognizer, bookingDialog);
    this.bot = new DialogAndWelcomeBot(
      config.getConversationState(),
      config.getUserState(),
      dialog
    );
  }

  async run(context: TurnContext): Promise<void> {
    await this.bot.run(context);
  }
}

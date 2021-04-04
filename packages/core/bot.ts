import { ActivityHandler, TurnContext } from "botbuilder-core";

import { BookingDialog } from "../dialog/booking";
import { MainDialog } from "../dialog/main";
import { FlightBookingRecognizer } from "../recognizer/flight-recognizer";
import { ConfigProvider } from "../models/config/config-provider";

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

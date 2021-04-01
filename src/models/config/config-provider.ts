import type { BotFrameworkAdapterSettings } from "botbuilder";
import type { FlightBookingRecognizerOption } from "../../dialogs/flight-recognizer";

import { Config } from "./base";

export class ConfigProvider {
  constructor(private config: Config) {}

  getAdapterSetting(): Partial<BotFrameworkAdapterSettings> {
    return {
      appId: this.config.getTryString("MicrosoftAppId").throw(),
      appPassword: this.config.getTryString("MicrosoftAppPassword").throw(),
    };
  }

  getLuisSetting(): FlightBookingRecognizerOption {
    return {
      applicationId: this.config.getTryString("LuisAppId").throw(),
      endpointKey: this.config.getTryString("LuisAPIKey").throw(),
      endpoint: `https://${this.config
        .getTryString("LuisAPIHostName")
        .throw()}`,
    };
  }
}

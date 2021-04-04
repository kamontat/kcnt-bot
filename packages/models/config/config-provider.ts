import type { FlightBookingRecognizerOption } from "../../recognizer/flight-recognizer";

import { ConversationState, MemoryStorage, UserState } from "botbuilder";
import { BotFrameworkAdapterSettings, Storage } from "botbuilder";

import { Config } from "./base";
import { name, version } from "../../../package.json";

export class ConfigProvider {
  private storage: Storage;

  private conversationState: ConversationState;
  private userState: UserState;

  constructor(private config: Config) {
    // For local development, in-memory storage is used.
    // CAUTION: The Memory Storage used here is for local bot debugging only. When the bot
    // is restarted, anything stored in memory will be gone.
    this.storage = new MemoryStorage();

    this.conversationState = new ConversationState(this.storage);
    this.userState = new UserState(this.storage);
  }

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

  getConversationState(): ConversationState {
    return this.conversationState;
  }

  getUserState(): UserState {
    return this.userState;
  }

  getAppName(): string {
    return name;
  }

  getAppVersion(): string {
    return version;
  }
}

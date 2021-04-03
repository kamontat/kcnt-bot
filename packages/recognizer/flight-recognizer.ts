import type { RecognizerResult, TurnContext } from "botbuilder-core";

import { LuisRecognizer } from "botbuilder-ai";

export interface FlightBookingRecognizerOption {
  applicationId: string;
  endpointKey: string;
  endpoint: string;
}

export interface FlightFromEntity {
  from: string;
  airport: string;
}

export interface FlightToEntity {
  to: string;
  airport: string;
}

export class FlightBookingRecognizer {
  private recognizer: LuisRecognizer;
  constructor(config: FlightBookingRecognizerOption) {
    // Set the recognizer options depending on which endpoint version you want to use e.g v2 or v3.
    // More details can be found in https://docs.microsoft.com/en-gb/azure/cognitive-services/luis/luis-migration-api-v3
    const recognizerOptions = {
      apiVersion: "v3",
    };

    this.recognizer = new LuisRecognizer(config, recognizerOptions);
  }

  /**
   * Returns an object with preformatted LUIS results for the bot's dialogs to consume.
   */
  async executeLuisQuery(context: TurnContext): Promise<RecognizerResult> {
    return await this.recognizer.recognize(context);
  }

  getFromEntities(result: RecognizerResult): FlightFromEntity {
    let fromValue, fromAirportValue;
    if (result.entities.$instance.From) {
      fromValue = result.entities.$instance.From[0].text;
    }
    if (fromValue && result.entities.From[0].Airport) {
      fromAirportValue = result.entities.From[0].Airport[0][0];
    }

    return { from: fromValue, airport: fromAirportValue };
  }

  getToEntities(result: RecognizerResult): FlightToEntity {
    let toValue, toAirportValue;
    if (result.entities.$instance.To) {
      toValue = result.entities.$instance.To[0].text;
    }
    if (toValue && result.entities.To[0].Airport) {
      toAirportValue = result.entities.To[0].Airport[0][0];
    }

    return { to: toValue, airport: toAirportValue };
  }

  /**
   * This value will be a TIMEX. And we are only interested in a Date so grab the first result and drop the Time part.
   * TIMEX is a format that represents DateTime expressions that include some ambiguity. e.g. missing a Year.
   */
  getTravelDate(result: RecognizerResult): undefined | string {
    const datetimeEntity = result.entities.datetime;
    if (!datetimeEntity || !datetimeEntity[0]) return undefined;

    const timex = datetimeEntity[0].timex;
    if (!timex || !timex[0]) return undefined;

    const datetime = timex[0].split("T")[0];
    return datetime;
  }
}

module.exports.FlightBookingRecognizer = FlightBookingRecognizer;

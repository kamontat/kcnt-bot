import type {
  DialogTurnResult,
  PromptValidatorContext,
  WaterfallStepContext,
} from "botbuilder-dialogs";

import { InputHints, MessageFactory } from "botbuilder";
import {
  DateTimePrompt,
  DateTimeResolution,
  WaterfallDialog,
} from "botbuilder-dialogs";

import { CancelAndHelpDialog } from "./cancel-and-help";

const DATETIME_PROMPT = "datetimePrompt";
const WATERFALL_DIALOG = "waterfallDialog";

export class DateResolverDialog extends CancelAndHelpDialog {
  constructor(id: string) {
    super(id || "dateResolverDialog");
    this.addDialog(
      new DateTimePrompt(
        DATETIME_PROMPT,
        this.dateTimePromptValidator.bind(this)
      )
    ).addDialog(
      new WaterfallDialog(WATERFALL_DIALOG, [
        this.initialStep.bind(this),
        this.finalStep.bind(this),
      ])
    );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  async initialStep(
    stepContext: WaterfallStepContext<Record<string, unknown>>
  ): Promise<DialogTurnResult> {
    const timex = stepContext.options.date;

    const promptMessageText = "On what date would you like to travel?";
    const promptMessage = MessageFactory.text(
      promptMessageText,
      promptMessageText,
      InputHints.ExpectingInput
    );

    const repromptMessageText =
      "I'm sorry, for best results, please enter your travel date including the month, day and year.";
    const repromptMessage = MessageFactory.text(
      repromptMessageText,
      repromptMessageText,
      InputHints.ExpectingInput
    );

    if (!timex) {
      // We were not given any date at all so prompt the user.
      return await stepContext.prompt(DATETIME_PROMPT, {
        prompt: promptMessage,
        retryPrompt: repromptMessage,
      });
    }

    return await stepContext.next([{ timex: timex }]);
  }

  async finalStep(
    stepContext: WaterfallStepContext<Record<string, unknown>>
  ): Promise<DialogTurnResult> {
    const timex = stepContext.result[0].timex;
    return await stepContext.endDialog(timex);
  }

  async dateTimePromptValidator(
    promptContext: PromptValidatorContext<DateTimeResolution[]>
  ): Promise<boolean> {
    return promptContext.recognized.succeeded;
  }
}

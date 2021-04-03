import { InputHints } from "botbuilder";
import {
  ComponentDialog,
  DialogContext,
  DialogTurnResult,
  DialogTurnStatus,
} from "botbuilder-dialogs";

/**
 * This base class watches for common phrases like "help" and "cancel" and takes action on them
 * BEFORE they reach the normal bot logic.
 */
export class CancelAndHelpDialog extends ComponentDialog {
  async onContinueDialog<T = unknown>(
    innerDc: DialogContext
  ): Promise<DialogTurnResult<T>> {
    const result = await this.interrupt<T>(innerDc);
    if (result) return result;

    return await super.onContinueDialog(innerDc);
  }

  async interrupt<T = unknown>(
    innerDc: DialogContext
  ): Promise<DialogTurnResult<T> | undefined> {
    if (innerDc.context.activity.text) {
      const text = innerDc.context.activity.text.toLowerCase();

      switch (text) {
        case "help":
        case "?": {
          const helpMessageText = "Show help here";
          await innerDc.context.sendActivity(
            helpMessageText,
            helpMessageText,
            InputHints.ExpectingInput
          );
          return { status: DialogTurnStatus.waiting };
        }
        case "cancel":
        case "quit": {
          const cancelMessageText = "Cancelling...";
          await innerDc.context.sendActivity(
            cancelMessageText,
            cancelMessageText,
            InputHints.IgnoringInput
          );
          return await innerDc.cancelAllDialogs();
        }
        default:
          return;
      }
    } else {
      return;
    }
  }
}
import type {
  ConversationState,
  StatePropertyAccessor,
  TurnContext,
  UserState,
} from "botbuilder";
import type { Dialog } from "botbuilder-dialogs";

import { ActivityHandler } from "botbuilder";
import { runDialog } from "botbuilder-dialogs";

export class DialogBot extends ActivityHandler {
  private dialogState: StatePropertyAccessor;
  constructor(
    private conversationState: ConversationState,
    private userState: UserState,
    private dialog: Dialog
  ) {
    super();

    this.dialogState = conversationState.createProperty("DialogState");

    this.onMessage(async (context, next) => {
      console.log("Running dialog with Message Activity.");

      await runDialog(this.dialog, context, this.dialogState);

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
  }

  /**
   * Override the ActivityHandler.run() method to save state changes after the bot logic completes.
   */
  async run(context: TurnContext): Promise<void> {
    await super.run(context);

    // Save any state changes. The load happened during the execution of the Dialog.
    await this.conversationState.saveChanges(context, false);
    await this.userState.saveChanges(context, false);
  }
}

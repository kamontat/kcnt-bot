import type { ConversationState, UserState } from "botbuilder";
import type { Dialog } from "botbuilder-dialogs";

// import { CardFactory } from "botbuilder";
import { runDialog } from "botbuilder-dialogs";
import { DialogBot } from "../base";

// import WelcomeCard from "./resources/card.json";

export class DialogAndWelcomeBot extends DialogBot {
  constructor(
    conversationState: ConversationState,
    userState: UserState,
    dialog: Dialog
  ) {
    super(conversationState, userState, dialog);

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded ?? [];
      for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        if (membersAdded[cnt].id !== context.activity.recipient.id) {
          // const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
          // await context.sendActivity({ attachments: [welcomeCard] });
          await runDialog(
            dialog,
            context,
            conversationState.createProperty("DialogState")
          );
        }
      }

      await next();
    });
  }
}

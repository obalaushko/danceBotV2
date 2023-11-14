import { MSG } from "../../../constants/messages.js";
import { privateChat } from "../../bot.js";

export const messageHears = () => {
    privateChat.on('message:text').filter(
        async (ctx) => {
            console.log(ctx.message.text);
            if (ctx.session?.editedUserId && ctx.session?.editedUserId !== null) {
                return true;
            } else return false;
        },
        async (ctx) => {
            console.log('msg', ctx.session);
            // clean session
            switch (ctx.message.text) {
                case MSG.buttons.cancel:
                    await ctx.reply(MSG.settings.setup.cancel, {
                        reply_markup: { remove_keyboard: true },
                    });
                    break;
                case MSG.buttons.developer.guest:
                    break;
                case MSG.buttons.developer.user:
                    break;
                case MSG.buttons.developer.inactive:
                    break;
                case MSG.buttons.developer.admin:
                    break;
                default:
                    await ctx.reply(MSG.settings.setup.cancel, {
                        reply_markup: { remove_keyboard: true },
                    });
                    break;
            }
        }
    );
    
}
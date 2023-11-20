import { MSG } from '../../../constants/messages.js';
import { LOGGER } from '../../../logger/index.js';
import { isObjectEmpty } from '../../../utils/utils.js';
import { privateChat } from '../../bot.js';

export const cancelCommand = () => {
    privateChat.command('cancel', async (ctx) => {
        const stats = await ctx.conversation.active();

        if (isObjectEmpty(stats)) {
            await ctx.reply(MSG.overLeaveConversation);
        } else {
            await ctx.conversation.exit();
            await ctx.reply(MSG.leaveConversation);
            LOGGER.info(`[guestConversations] Leave the conversation`);
        }
    });
};

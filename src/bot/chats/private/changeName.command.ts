import { ROLES } from '../../../constants/global.js';
import { MSG } from '../../../constants/messages.js';
import { getUserById } from '../../../mongodb/operations/users.js';
import { privateChat } from '../../bot.js';

/**
 * Defines the changeNameCommand function.
 * This function handles the 'changename' command in private chats.
 * It checks if the user is not a bot, and if the user exists and has an active role,
 * it enters the 'changeNameConversations' conversation. Otherwise, it replies with a disabled command message.
 */
export const changeNameCommand = () => {
    privateChat.command('changename', async (ctx) => {
        const {
            user: { is_bot, id },
        } = await ctx.getAuthor();

        if (is_bot) return;
        const userExists = await getUserById(id);

        if (userExists && userExists.role !== ROLES.Inactive) {
            await ctx.conversation.enter('changeNameConversations');
        } else {
            await ctx.reply(MSG.commandDisabled);
        }
    });
};

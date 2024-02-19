import { ROLES } from '../../../constants/global.js';
import { MSG } from '../../../constants/messages.js';
import { getUserById } from '../../../mongodb/operations/users.js';
import { privateChat } from '../../bot.js';

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

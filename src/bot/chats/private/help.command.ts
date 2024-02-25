import { MSG } from '../../../constants/messages.js';
import { privateChat } from '../../bot.js';

/**
 * Defines the help command for private chats.
 */
export const helpCommand = () => {
    privateChat.command('help', async (ctx) => {
        const {
            user: { is_bot },
        } = await ctx.getAuthor();

        if (is_bot) return;

        await ctx.reply(MSG.help);
    });
};

import { privateChat } from '../../bot/bot.js';
import { LOGGER } from '../../logger/index.js';

/**
 * Executes the crypto command in a private chat.
 * If the author of the message is a bot, the command is ignored.
 * Enters the 'cryptoConversations' conversation.
 */
export const cryptoCommand = () => {
    privateChat.command('crypto', async (ctx) => {
        const {
            user: { is_bot },
        } = await ctx.getAuthor();

        if (is_bot) return;

        await ctx.conversation.enter('cryptoConversations');
        const { user } = await ctx.getAuthor();
        LOGGER.info('[cryptoConversations]', { metadata: user });
    });
};

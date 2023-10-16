import { BotContext, ConverstaionContext } from '../types';
import { LOGGER } from '../../logger';
import startMenu from '../menu';

const startConversation = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => {
    if (ctx.from === undefined) return;

    const { user } = await ctx.getAuthor();

    if (user.is_bot) return;

    LOGGER.info('[startConversation]', { metadata: user });

    ctx.reply(`Welcome ${user.first_name}, your id: ${user.id}`, {
        reply_markup: startMenu,
    });
};

export { startConversation };

import { BotContext, ConverstaionContext } from '../types';
import { LOGGER } from '../../logger';

const startConversation = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => {
    if (ctx.from === undefined) return false;

    const { user } = await ctx.getAuthor();

    LOGGER.info('[startConversation]', { metadata: user });

    ctx.reply(`Welcome ${user.first_name}!`);
};

export { startConversation }

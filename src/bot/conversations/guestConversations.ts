import { BotContext, ConverstaionContext } from '../types/index.js';

import { LOGGER } from '../../logger/index.js';
import { MSG } from '../../constants/index.js';

export const guestConversations = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => {
    const { user } = await ctx.getAuthor();
    LOGGER.info('[guestConversations]', { metadata: user });

    await ctx.reply(MSG.waitAssigned);

    return;
};

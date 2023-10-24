import { BotContext, ConverstaionContext } from '../types';

import { LOGGER } from '../../logger';
import { MSG } from '../../constants';

export const guestConversations = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => {
    const { user } = await ctx.getAuthor();
    LOGGER.info('[guestConversations]', { metadata: user });

    await ctx.reply(MSG.waitAssigned);
    return;
};

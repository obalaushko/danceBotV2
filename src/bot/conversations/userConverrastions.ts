import { BotContext, ConverstaionContext } from '../types';

import { LOGGER } from '../../logger';
import { MSG } from '../../constants';

export const userConversations = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => {
    const { user } = await ctx.getAuthor();
    LOGGER.info('[userConversations]', { metadata: user });

    await ctx.reply(MSG.welcome.user(user));

    return;
};

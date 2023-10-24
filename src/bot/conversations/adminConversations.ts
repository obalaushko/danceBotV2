import { BotContext, ConverstaionContext } from "../types";

import { LOGGER } from '../../logger';

export const adminConversations = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => { 
    const { user } = await ctx.getAuthor();
    LOGGER.info('[adminConversations]', { metadata: user });
}
import { BotContext, ConverstaionContext } from "../types";

import { LOGGER } from '../../logger';

export const developerConversations = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => { 
    const { user } = await ctx.getAuthor();
    LOGGER.info('[developerConversations]', { metadata: user });
}
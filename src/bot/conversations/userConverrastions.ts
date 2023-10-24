import { BotContext, ConverstaionContext } from "../types";

import { LOGGER } from '../../logger';

export const userConversations = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => { 
    const { user } = await ctx.getAuthor();
    LOGGER.info('[userConversations]', { metadata: user });
}
import { BotContext, ConverstaionContext } from '../types/index.js';

import { LOGGER } from '../../logger/index.js';
import { MSG } from '../../constants/index.js';

/**
 * Handles guest conversations.
 * 
 * @param conversation - The conversation context.
 * @param ctx - The bot context.
 * @returns A promise that resolves when the conversation is handled.
 */
export const guestConversations = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => {
    const { user } = await ctx.getAuthor();
    LOGGER.info('[guestConversations]', { metadata: user });

    await ctx.reply(MSG.waitAssigned);

    return;
};

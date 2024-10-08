import { BotContext, ConverstaionContext } from '../types/index.js';

import { LOGGER } from '../../logger/index.js';
import { MSG } from '../../constants/index.js';
import { addUser, addSubscription } from '../../mongodb/operations/index.js';
import { isCancel } from '../../utils/utils.js';
import { ENV_VARIABLES } from '../../constants/global.js';

/**
 * Registers conversations for the bot.
 *
 * @param conversation - The conversation context.
 * @param ctx - The bot context.
 * @returns A promise that resolves when the conversations are registered.
 */
export const registerConversations = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => {
    const { user } = await ctx.getAuthor();

    await ctx.reply(MSG.welcome.notRegistered);

    let isValidFormat = false;
    let fullName = '';

    while (!isValidFormat) {
        const { message } = await conversation.waitFor('message:text');
        const messageText = message?.text;

        if (isCancel(messageText || '')) {
            await ctx.reply(MSG.leaveConversation);
            await ctx.conversation.exit();
            LOGGER.info(`[registerConversations] Leave the conversation`);
            return;
        }

        if (messageText) {
            const nameSurnameRegex = /^[\p{L} ]+ [\p{L} ]+$/u;
            const match = nameSurnameRegex.exec(messageText);

            if (match) {
                const cleanedInput = messageText.replace(/\s+/g, ' ').trim();
                fullName = cleanedInput;
                isValidFormat = true;
            } else {
                await ctx.reply(MSG.wrongRegister);
            }
        }
    }

    LOGGER.info(`[registerConversations] Ім'я та Прізвище: ${fullName}`);

    const newSubscriptions = await conversation.external(
        async () =>
            await addSubscription({
                userId: user.id,
            })
    );

    const newUser = await conversation.external(
        async () =>
            await addUser({
                userId: user.id,
                username: user.username || '',
                firstName: user.first_name || '',
                fullName,
                subscription: newSubscriptions,
            })
    );

    if (newUser) {
        await ctx.reply(MSG.welcome.noRoleAssigned(newUser));

        try {
            await ctx.api.sendMessage(
                ENV_VARIABLES.ADMIN_ID,
                MSG.approveUser(newUser)
            );
        } catch (error) {
            LOGGER.error(
                `[registerConversations]: Send admin message ${error}`
            );
        }
    }

    return;
};

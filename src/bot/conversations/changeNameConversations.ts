import { BotContext, ConverstaionContext } from '../types/index.js';

import { LOGGER } from '../../logger/index.js';
import { MSG } from '../../constants/index.js';
import { updateUserById } from '../../mongodb/operations/index.js';
import { isCancel } from '../../utils/utils.js';

/**
 * Changes the name of the user in a conversation.
 *
 * @param conversation - The conversation context.
 * @param ctx - The bot context.
 * @returns A promise that resolves when the name is successfully changed.
 */
export const changeNameConversations = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => {
    const { user } = await ctx.getAuthor();
    LOGGER.info('[changeNameConversations]', { metadata: user });

    await ctx.reply(MSG.updateFullName);

    let isValidFormat = false;
    let fullName = '';

    while (!isValidFormat) {
        const { message } = await conversation.waitFor('message:text');
        const messageText = message?.text;

        if (isCancel(messageText || '')) {
            await ctx.reply(MSG.leaveConversation);
            await ctx.conversation.exit();
            LOGGER.info(`[changeNameConversations] Leave the conversation`);
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

    LOGGER.info(`[changeNameConversations] Ім'я та Прізвище: ${fullName}`);

    const updateFullName = await conversation.external(
        async () =>
            await updateUserById(user.id, {
                fullName,
                firstName: user.first_name,
                username: user.username,
            })
    );
    if (updateFullName) {
        await ctx.reply(MSG.updatedFullName(updateFullName), {
            parse_mode: 'MarkdownV2',
        });
    } else {
        LOGGER.error(`[changeNameConversations] updatedFullName failed`);
    }

    return;
};

import { BotContext, ConverstaionContext } from '../types';

import { LOGGER } from '../../logger';
import { MSG } from '../../constants';
import { updateUserById } from '../../mongodb/operations';

export const guestConversations = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => {
    const { user } = await ctx.getAuthor();
    LOGGER.info('[guestConversations]', { metadata: user });

    await ctx.reply(MSG.waitAssigned);

    const {
        message: { text },
    } = await conversation.waitFor('message:text');

    if (text === '/changename') {
        await ctx.reply(MSG.updateFullName);

        let isValidFormat = false;
        let fullName = '';

        while (!isValidFormat) {
            const { message } = await conversation.waitFor('message:text');
            const messageText = message?.text;

            if (messageText) {
                const nameSurnameRegex = /^[\p{L} ]+ [\p{L} ]+$/u;
                const match = nameSurnameRegex.exec(messageText);

                if (match) {
                    const cleanedInput = messageText
                        .replace(/\s+/g, ' ')
                        .trim();
                    fullName = cleanedInput;
                    isValidFormat = true;
                } else {
                    await ctx.reply(MSG.wrongRegister);
                }
            }
        }

        LOGGER.info(`[guestConversations] Ім'я та Прізвище: ${fullName}`);

        const updateFullName = await conversation.external(
            async () =>
                await updateUserById(user.id, {
                    fullName,
                })
        );
        if (updateFullName) {
            await ctx.reply(MSG.updatedFullName(updateFullName), {
                parse_mode: 'MarkdownV2',
            });
        } else {
            LOGGER.error(`[guestConversations] updatedFullName failed`);
        }
    }

    return;
};

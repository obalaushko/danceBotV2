import { BotContext, ConverstaionContext } from '../types';

import { LOGGER } from '../../logger';
import { MSG } from '../../constants';
import { addUser } from '../../mongodb/operations';

export const registerConversations = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => {
    const { user } = await ctx.getAuthor();
    LOGGER.info('[registerConversations]', { metadata: user });

    await ctx.reply(MSG.welcome.notRegistered);

    let isValidFormat = false;
    let fullName = '';

    while (!isValidFormat) {
        const { message } = await conversation.waitFor('message:text');
        const messageText = message?.text;

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

    const newUser = await conversation.external(async () =>
        addUser({
            userId: user.id,
            username: user.username || '',
            firstName: user.first_name || '',
            fullName,
        })
    );

    if (newUser) {
        await ctx.reply(MSG.welcome.noRoleAssigned(newUser));
        return;
    }
};

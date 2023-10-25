import { BotContext, ConverstaionContext } from '../types';

import { LOGGER } from '../../logger';
import { MSG } from '../../constants';
import { addUser, addSubscription } from '../../mongodb/operations';

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

    const newSubscriptions = await conversation.external(
        async () =>
            await addSubscription({
                userId: user.id,
                totalLessons: 8,
                usedLessons: 0,
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

        await ctx.api.sendMessage(324131584, MSG.approveUser(newUser)); // replace id to ENV.ADMIN_ID
    }

    return;
};

import { BotContext, ConverstaionContext } from '../types';

import { LOGGER } from '../../logger';
import { MSG } from '../../constants';
import { addUser, addSubscription } from '../../mongodb/operations';
import { isCancel } from '../../utils/utils';

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

        await ctx.api.sendMessage(324131584, MSG.approveUser(newUser)); // replace id to ENV.ADMIN_ID
    }

    return;
};
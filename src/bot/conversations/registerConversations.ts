import { BotContext, ConverstaionContext } from '../types';

import { LOGGER } from '../../logger';
import { MSG, ROLES } from '../../constants';
import { addUser, updateUserById } from '../../mongodb/operations';
import { InlineKeyboard } from 'grammy';

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

    const newUser = await conversation.external(
        async () =>
            await addUser({
                userId: user.id,
                username: user.username || '',
                firstName: user.first_name || '',
                fullName,
            })
    );
    
    if (newUser) {
        await ctx.reply(MSG.welcome.noRoleAssigned(newUser));

        // Перенести до окремої команди адміну
        // const inlineKeyboard = new InlineKeyboard()
        //     .text(MSG.buttons.approve, 'click-approve-user')
        //     .text(MSG.buttons.cancel, 'click-cancel-user');

        // await ctx.api.sendMessage(324131584, MSG.approveUser(newUser), {
        //     reply_markup: inlineKeyboard,
        // });

        // const approveUser =
        //     await conversation.waitForCallbackQuery('click-approve-user');

        // if (approveUser) {
        //     // const updateUser = await conversation.external(
        //     //     async () =>
        //     //         await updateUserById(newUser.userId, {
        //     //             role: ROLES.User,
        //     //         })
        //     // );
        //     await ctx.reply(MSG.approved(newUser));
        // }

        // const cancelUser =
        //     await conversation.waitForCallbackQuery('click-cancel-user');

        // if (cancelUser) {
        //     await ctx.reply(MSG.backToWait(newUser));
        // }

        return;
    }
};

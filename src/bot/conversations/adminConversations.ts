import { BotContext, ConverstaionContext } from '../types';

import { LOGGER } from '../../logger';
import { InlineKeyboard } from 'grammy';
import { MSG } from '../../constants';
import { getAllGuestUsers } from '../../mongodb/operations';

//! Don't use conversations if you want to use complicated menu
export const adminConversations = async (
    conversation: ConverstaionContext,
    ctx: BotContext
) => {
    const { user } = await ctx.getAuthor();
    LOGGER.info('[adminConversations]', { metadata: user });

    // const startConversation = async () => {
    //     // Start menu & message
    //     const startMenu = new InlineKeyboard()
    //         .text(MSG.buttons.admin.approveUser, 'approveUser')
    //         .text(MSG.buttons.admin.markUser, 'markUser')
    //         .row()
    //         .text(MSG.buttons.admin.showAllUser, 'showAllUser')
    //         .text(MSG.buttons.admin.settings, 'updateUser')
    //         .row()
    //         .text(MSG.buttons.admin.removeUser, 'removeUser');

    //     const backToMain = new InlineKeyboard().text(
    //         MSG.buttons.backToMain,
    //         'backToMain'
    //     );

    //     await ctx.reply(MSG.welcome.admin(user), { reply_markup: startMenu });

    //     const responseStartMenu = await conversation.waitForCallbackQuery([
    //         'approveUser',
    //         'markUser',
    //         'showAllUser',
    //         'updateUser',
    //         'removeUser',
    //     ]);

    //     if (responseStartMenu.match === 'approveUser') {
    //         const allGuestUsers = await conversation.external(
    //             async () => await getAllGuestUsers()
    //         );

    //         if (allGuestUsers?.length) {
    //             await ctx.reply(MSG.showGuestUsers(allGuestUsers), {
    //                 parse_mode: 'HTML',
    //             });
    //         } else {
    //             await ctx.reply(MSG.nowNewUsers, { reply_markup: backToMain });

    //             const responseBackToMain =
    //                 await conversation.waitForCallbackQuery('backToMain');

    //             if (responseBackToMain) {
    //                 await startConversation();
    //                 return;
    //             }
    //         }
    //     } else if (responseStartMenu.match === 'markUser') {
    //         console.log('markUser');
    //         await startConversation();
    //         return;
    //     }else if (responseStartMenu.match === 'showAllUser') {
    //         console.log('showAllUser');
    //         await startConversation();
    //         return;
    //     }else if (responseStartMenu.match === 'updateUser') {
    //         console.log('updateUser');
    //         await startConversation();
    //         return;
    //     }else if (responseStartMenu.match === 'removeUser') {
    //         console.log('removeUser');
    //         await startConversation();
    //         return;
    //     }
    // };

    // await startConversation();

    // const cancelUser =
    //     await conversation.waitForCallbackQuery('click-cancel-user');

    // if (cancelUser) {
    //     await ctx.reply(MSG.backToWait(newUser));
    // }
    return;
};

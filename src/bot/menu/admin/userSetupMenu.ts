import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants/messages.js';
import { Keyboard } from 'grammy';
import { SessionContext } from '../../types/index.js';

// User Menu
export const setupUserMenu = new Menu<SessionContext>('setupUserMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
})
    .text('role', async (ctx) => {
        console.log(ctx.session.editedUserId);
        await ctx.reply(MSG.settings.setup.role, {
            reply_markup: keyboardRoles,
        });
    })
    .text('notifications', async (ctx) => {
        await ctx.reply(MSG.settings.setup.role, {
            reply_markup: keyboardRoles,
        });
    })
    .row()
    .text('totalLessons', async (ctx) => {
        await ctx.reply(MSG.settings.setup.role, {
            reply_markup: keyboardRoles,
        });
    })
    .text('usedLessons', async (ctx) => {
        await ctx.reply(MSG.settings.setup.role, {
            reply_markup: keyboardRoles,
        });
    })
    .row()
    .text(MSG.buttons.back, async (ctx) => {
        ctx.menu.back();
        await ctx.editMessageText(MSG.settings.users);
        ctx.session.editedUserId = null;
    });

const keyboardRoles = new Keyboard()
    .text(MSG.buttons.developer.guest)
    .text(MSG.buttons.developer.user)
    .row()
    .text(MSG.buttons.developer.inactive)
    .text(MSG.buttons.developer.admin)
    .row()
    .text(MSG.buttons.cancel)
    .resized()
    .oneTime();

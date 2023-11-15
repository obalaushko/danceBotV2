import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants/messages.js';
import { Keyboard } from 'grammy';
import { SessionContext } from '../../types/index.js';

// User Menu
export const setupUserMenu = new Menu<SessionContext>('setupUserMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
})
    .text('Role', async (ctx) => {
        ctx.session.editedActions = 'Role';
        await ctx.reply(MSG.settings.setup.role, {
            reply_markup: keyboardRoles,
        });
    })
    .text('Notifications', async (ctx) => {
        ctx.session.editedActions = 'Notifications';
        await ctx.reply(MSG.settings.setup.notifications, {
            reply_markup: keyboardNotifications,
        });
    })
    .row()
    .text('TotalLessons', async (ctx) => {
        ctx.session.editedActions = 'TotalLessons';
        await ctx.reply(MSG.settings.setup.totalLessons, {
            reply_markup: keyboardLessons,
        });
    })
    .text('UsedLessons', async (ctx) => {
        ctx.session.editedActions = 'UsedLessons';
        await ctx.reply(MSG.settings.setup.usedLessons, {
            reply_markup: keyboardLessons,
        });
    })
    .row()
    .text(MSG.buttons.back, async (ctx) => {
        ctx.menu.back();
        await ctx.editMessageText(MSG.settings.users);
        ctx.session.editedActions = null;
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

const keyboardNotifications = new Keyboard()
    .text(MSG.buttons.user.notificationActivate)
    .text(MSG.buttons.user.notificationDisabled)
    .row()
    .text(MSG.buttons.cancel)
    .resized()
    .oneTime();

const keyboardLessons = new Keyboard()
    .text(MSG.buttons.settings.lessons[1])
    .text(MSG.buttons.settings.lessons[2])
    .row()
    .text(MSG.buttons.settings.lessons[3])
    .text(MSG.buttons.settings.lessons[4])
    .row()
    .text(MSG.buttons.settings.lessons[5])
    .text(MSG.buttons.settings.lessons[6])
    .row()
    .text(MSG.buttons.settings.lessons[7])
    .text(MSG.buttons.settings.lessons[8])
    .row()
    .text(MSG.buttons.cancel)
    .resized()
    .oneTime();

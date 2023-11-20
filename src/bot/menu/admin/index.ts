import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants/index.js';
import { approveUserMenu } from './approveUserMenu.js';
import { markUserMenu } from './markUserMenu.js';
import { updateSubscriptionMenu } from './updateSubscriptionMenu.js';
import { showUserMenu } from './showUserMenu.js';
import { updatePaymentDetailsMenu } from './updatePaymentDetailsMenu.js';
import { settingsMenu } from './settingsMenu.js';
import { removeUserMenu } from './removeUserMenu.js';

export const adminMenu = new Menu('admin')
    .text(MSG.buttons.admin.approveUser, async (ctx) => {
        ctx.menu.nav('approveUserMenu');
        await ctx.editMessageText(MSG.chooseUserToApprove);
    })
    .text(MSG.buttons.admin.markUser, async (ctx) => {
        ctx.menu.nav('markUserMenu');
        await ctx.editMessageText(MSG.chooseUserToMark(null));
    })
    .row()
    .text(MSG.buttons.admin.updateSubscription, async (ctx) => {
        ctx.menu.nav('updateSubscriptionMenu');
        await ctx.editMessageText(MSG.chooseSubscriptionsActions);
    })
    .text(MSG.buttons.admin.showAllUser, async (ctx) => {
        ctx.menu.nav('showUserMenu');
        await ctx.editMessageText(MSG.showUsers.main);
    })
    .row()
    .text(MSG.buttons.admin.updatePaymentDetails, async (ctx) => {
        ctx.menu.nav('updatePaymentDetailsMenu');
        await ctx.editMessageText(MSG.payments.static);
    })
    .text(MSG.buttons.admin.settings, async (ctx) => {
        ctx.menu.nav('settingsMenu');
        await ctx.editMessageText(MSG.settings.main);
    })
    .row()
    .text(MSG.buttons.admin.removeUser, async (ctx) => {
        ctx.menu.nav('removeUserMenu');
        await ctx.editMessageText(MSG.remove.main);
    });

adminMenu.register(approveUserMenu);
adminMenu.register(markUserMenu);
adminMenu.register(updateSubscriptionMenu);
adminMenu.register(showUserMenu);
adminMenu.register(updatePaymentDetailsMenu);
adminMenu.register(settingsMenu);
adminMenu.register(removeUserMenu);

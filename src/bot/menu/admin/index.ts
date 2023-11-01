import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants';
import { approveUserMenu } from './approveUserMenu';
import { markUserMenu } from './markUserMenu';
import { updateSubscriptionMenu } from './updateSubscriptionMenu';
import { showUserMenu } from './showUserMenu';
import { updatePaymentDetailsMenu } from './updatePaymentDetailsMenu';
import { settingsMenu } from './settingsMenu';
import { removeUserMenu } from './removeUserMenu';

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
        await ctx.reply(MSG.commandDisabled);
        await ctx.reply(MSG.payments.static);
    })
    .text(MSG.buttons.admin.settings, async (ctx) => {
        ctx.menu.nav('settingsMenu');
        await ctx.editMessageText(MSG.settings.main)
    })
    .row()
    .text(MSG.buttons.admin.removeUser, async (ctx) => {
        ctx.menu.nav('removeUserMenu');
        await ctx.editMessageText(MSG.remove.main)
    });

adminMenu.register(approveUserMenu);
adminMenu.register(markUserMenu);
adminMenu.register(updateSubscriptionMenu);
adminMenu.register(showUserMenu);
adminMenu.register(updatePaymentDetailsMenu);
adminMenu.register(settingsMenu);
adminMenu.register(removeUserMenu);

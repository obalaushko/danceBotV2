import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants';
import { approveUserMenu } from './approveUserMenu';
import { markUserMenu } from './markUserMenu';
import { updateSubscriptionMenu } from './updateSubscriptionMenu';

export const adminMenu = new Menu('admin')
    .text(MSG.buttons.admin.approveUser, async (ctx) => {
        ctx.menu.nav('approveUserMenu');
        await ctx.editMessageText(MSG.chooseUserToApprove);
    })
    .text(MSG.buttons.admin.markUser, async (ctx) => {
        ctx.menu.nav('markUserMenu');
        await ctx.editMessageText(MSG.chooseUserToMark);
    })
    .row()
    .text(MSG.buttons.admin.updateSubscription, async (ctx) => {
        ctx.menu.nav('updateSubscriptionMenu');
        await ctx.editMessageText(MSG.chooseSubscriptionsActions);
    })
    .submenu(MSG.buttons.admin.updateUser, 'updateUserMenu')
    .row()
    .submenu(MSG.buttons.admin.updatePaymentDetails, 'updatePaymentDetailsMenu')
    .submenu(MSG.buttons.admin.showAllUser, 'showUserMenu')
    .row()
    .submenu(MSG.buttons.admin.removeUser, 'removeUserMenu');

adminMenu.register(approveUserMenu);
adminMenu.register(markUserMenu);
adminMenu.register(updateSubscriptionMenu);

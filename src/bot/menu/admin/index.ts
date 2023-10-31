import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants';
import { approveUserMenu } from './approveUserMenu';
import { markUserMenu } from './markUserMenu';
import { updateSubscriptionMenu } from './updateSubscriptionMenu';
import { showUserMenu } from './showUserMenu';
import { updatePaymentDetailsMenu } from './updatePaymentDetailsMenu';
import { settingsMenu } from './settingsMenu';
import { removeUserMenu } from './removeUserMenu';
import { getPaymentDetailsExist } from '../../../mongodb/operations';

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
        const { user } = await ctx.getAuthor();
        const userWithPayment = await getPaymentDetailsExist(user.id);

        console.log(userWithPayment);
        await ctx.reply(MSG.payments.main(userWithPayment));
    })
    .text(MSG.buttons.admin.settings, async (ctx) => {
        ctx.menu.nav('settingsMenu');
    })
    .row()
    .text(MSG.buttons.admin.removeUser, async (ctx) => {
        ctx.menu.nav('removeUserMenu');
    });

adminMenu.register(approveUserMenu);
adminMenu.register(markUserMenu);
adminMenu.register(updateSubscriptionMenu);
adminMenu.register(showUserMenu);
adminMenu.register(updatePaymentDetailsMenu);
adminMenu.register(settingsMenu);
adminMenu.register(removeUserMenu);

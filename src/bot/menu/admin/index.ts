import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants';
import { approveUserMenu } from './approveUserMenu';
import { activeteSubscription, deactivateSubscription, getAllActiveUserUsers, markLessonAsUsed } from '../../../mongodb/operations';

export const adminMenu = new Menu('admin')
    .text(MSG.buttons.admin.approveUser, async (ctx) => {
        ctx.menu.nav('approveUserMenu');
        await ctx.editMessageText(MSG.chooseUserToApprove);
    })
    .text(MSG.buttons.admin.markUser, async (ctx) => {
        // ctx.menu.nav('markUserMenu');
        const users = await getAllActiveUserUsers()

        console.log(users)
        await markLessonAsUsed(34497913)
    })
    .row()
    .text(MSG.buttons.admin.updateSubscription, async (ctx) => {
        // 'updateSubscriptionMenu'
        await activeteSubscription(34497913)
    })
    .submenu(MSG.buttons.admin.updateUser, 'updateUserMenu')
    .row()
    .submenu(MSG.buttons.admin.updatePaymentDetails, 'updatePaymentDetailsMenu')
    .submenu(MSG.buttons.admin.showAllUser, 'showUserMenu')
    .row()
    .submenu(MSG.buttons.admin.removeUser, 'removeUserMenu');

adminMenu.register(approveUserMenu);

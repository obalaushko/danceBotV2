import {
    getAllActiveUserUsers,
    getAllDeactiveUserUsers,
    getAllGuestUsers,
    getAllUsers,
} from './../../../mongodb/operations/users';
import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants';
import { backToMain } from './backToMainMenu';

export const showUserMenu = new Menu('showUserMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
})
    .text(MSG.buttons.showUsers.activeUsers, async (ctx) => {
        const activeUsers = await getAllActiveUserUsers();

        ctx.menu.nav('backToMain');
        await ctx.editMessageText(MSG.showUsers.active(activeUsers));
    })
    .text(MSG.buttons.showUsers.notActiveUsers, async (ctx) => {
        const notActiveUsers = await getAllDeactiveUserUsers();

        ctx.menu.nav('backToMain');
        await ctx.editMessageText(MSG.showUsers.notActive(notActiveUsers));
    })
    .text(MSG.buttons.showUsers.waitToApproveUsers, async (ctx) => {
        const waitToApproveUsers = await getAllGuestUsers();

        ctx.menu.nav('backToMain');
        await ctx.editMessageText(MSG.showUsers.waitToApprove(waitToApproveUsers));
    })
    .text(MSG.buttons.showUsers.allUsers, async (ctx) => {
        const allUsers = await getAllUsers();

        ctx.menu.nav('backToMain');
        await ctx.editMessageText(MSG.showUsers.all(allUsers));
    })
    .row()
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.back();
        await ctx.editMessageText(MSG.welcome.admin(user));
    });

showUserMenu.register(backToMain);

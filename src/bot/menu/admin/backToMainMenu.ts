import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants/index.js';

export const backToMain = new Menu('backToMain', {
    onMenuOutdated: MSG.onMenuOutdated,
})
    .text(MSG.buttons.back, async (ctx) => {
        ctx.menu.back();
        await ctx.editMessageText(MSG.showUsers.main);
    })
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.nav('admin');
        await ctx.editMessageText(MSG.welcome.admin(user));
    });

import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants';

export const backToUserMain = new Menu('backToUserMain', {
    onMenuOutdated: MSG.onMenuOutdated,
})
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.nav('user');
        await ctx.editMessageText(MSG.welcome.user(user));
    });

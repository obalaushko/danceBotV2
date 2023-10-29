import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants';

export const showUserMenu = new Menu('showUserMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
}).text(MSG.buttons.backToMain, async (ctx) => {
    const { user } = await ctx.getAuthor();
    ctx.menu.back();
    await ctx.editMessageText(MSG.welcome.admin(user));
});

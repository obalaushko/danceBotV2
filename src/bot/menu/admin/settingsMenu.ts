import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants/index.js';

export const settingsMenu = new Menu('settingsMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
}).text(MSG.buttons.backToMain, async (ctx) => {
    const { user } = await ctx.getAuthor();
    ctx.menu.back();
    await ctx.editMessageText(MSG.welcome.admin(user));
});

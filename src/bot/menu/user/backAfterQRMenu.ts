import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants/index.js';
import { userMenu } from './index.js';

export const backAfterQRMenu = new Menu('backAfterQRMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
}).text(MSG.buttons.backToMain, async (ctx) => {
    const { user } = await ctx.getAuthor();

    await ctx.deleteMessage();
    await ctx.reply(MSG.welcome.user(user), { reply_markup: userMenu });
});

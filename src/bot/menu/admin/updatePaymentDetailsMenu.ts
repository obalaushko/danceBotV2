import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants/index.js';

export const updatePaymentDetailsMenu = new Menu('updatePaymentDetailsMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
})
    .row()
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.back();
        await ctx.editMessageText(MSG.welcome.admin(user));
    });

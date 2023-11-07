import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants';
import { userMenu } from '../user';
import { adminMenu } from '../admin';

export const developerMenu = new Menu('developer')
    .text(MSG.buttons.developer.admin, async (ctx) => {
        const { user } = await ctx.getAuthor();
        await ctx.reply(MSG.welcome.admin(user), {
            reply_markup: adminMenu,
        });
    })
    // .text(MSG.buttons.developer.guest, async (ctx) => {})
    .row()
    .text(MSG.buttons.developer.user, async (ctx) => {
        const { user } = await ctx.getAuthor();

        await ctx.reply(MSG.welcome.user(user), {
            reply_markup: userMenu,
        });
    })
    // .text(MSG.buttons.developer.inactive, async (ctx) => {
    //     await ctx.reply(MSG.deactivatedAccount);
    // });

developerMenu.register(userMenu);
developerMenu.register(adminMenu);

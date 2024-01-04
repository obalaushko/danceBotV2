import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants/messages.js';
import { getUserWithSubscriptionById } from '../../../mongodb/operations/users.js';

const freezeSubMenu = new Menu('freezeSubMenu')
    .text(MSG.buttons.user.freezeApprove, async (ctx) => {})
    .row()
    .text(MSG.buttons.back, async (ctx) => {
        const {
            user: { id },
        } = await ctx.getAuthor();
        const user = await getUserWithSubscriptionById(id);
        ctx.menu.back();
        if (user) {
            await ctx.editMessageText(MSG.user.subscription(user));
        } else {
            await ctx.editMessageText(MSG.errors.unknownError);
        }
    })
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.nav('user');
        await ctx.editMessageText(MSG.welcome.user(user));
    });

export const freezeSubscriptionMenu = new Menu('freezeSubscriptionMenu')
    .text(MSG.buttons.user.freezeSubscription, async (ctx) => {
        ctx.menu.nav('freezeSubMenu');
        await ctx.editMessageText(MSG.user.freeze.main);
    })
    .row()
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.nav('user');
        await ctx.editMessageText(MSG.welcome.user(user));
    });

freezeSubscriptionMenu.register(freezeSubMenu);

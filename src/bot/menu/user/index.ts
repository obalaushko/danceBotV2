import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants';
import { backToUserMain } from './backToMainMenu';
import { getUserWithSubscriptionById } from '../../../mongodb/operations';

export const userMenu = new Menu('user')
    .text(MSG.buttons.user.showSubscription, async (ctx) => {
        const { user: {id} } = await ctx.getAuthor();

        const user = await getUserWithSubscriptionById(id);

        if (user) {
            ctx.menu.nav('backToUserMain');
            await ctx.editMessageText(MSG.user.subscription(user));
        } else {
            await ctx.editMessageText(MSG.errors.unknownError);
        }
    })
    .text(MSG.buttons.user.notifications)
    .row()
    .text(MSG.buttons.user.paymentDetails, async (ctx) => {
        
        ctx.menu.nav('backToUserMain');
        await ctx.editMessageText(MSG.payments.static);
    });

userMenu.register(backToUserMain);

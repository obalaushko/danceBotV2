import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants/index.js';
import { getUserWithSubscriptionById } from '../../../mongodb/operations/users.js';
import { subscriptionMenu } from './subscriptionMenu.js';

export const backAfterQRMenu = new Menu('backAfterQRMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
}).text(MSG.buttons.back, async (ctx) => {
    const {
        user: { id },
    } = await ctx.getAuthor();

    const user = await getUserWithSubscriptionById(id);
    if (user) {
        await ctx.deleteMessage();
        await ctx.reply(MSG.user.subscription(user), {
            reply_markup: subscriptionMenu,
        });
    }
});

import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants/index.js';
import { getUserWithSubscriptionById } from '../../../mongodb/operations/users.js';
import { subscriptionMenu } from './subscriptionMenu.js';
import { LOGGER } from '../../../logger/index.js';

export const backAfterQRMenu = new Menu('backAfterQRMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
}).text(MSG.buttons.back, async (ctx) => {
    const {
        user: { id },
    } = await ctx.getAuthor();

    const user = await getUserWithSubscriptionById(id);
    if (user) {
        try {
            await ctx.deleteMessage();
        } catch (error) {
            LOGGER.warn('[backAfterQRMenu][delete MSG]', { metadata: error });
        }
        await ctx.reply(MSG.user.subscription(user), {
            reply_markup: subscriptionMenu,
        });
    }
});

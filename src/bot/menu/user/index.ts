import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants/index.js';
import { backToUserMain } from './backToMainMenu.js';
import {
    getUserById,
    getUserWithSubscriptionById,
} from '../../../mongodb/operations/index.js';
import { notificationsMenu } from './notificationsMenu.js';
import { LOGGER } from '../../../logger/index.js';

export const userMenu = new Menu('user')
    .text(MSG.buttons.user.showSubscription, async (ctx) => {
        const {
            user: { id },
        } = await ctx.getAuthor();

        const user = await getUserWithSubscriptionById(id);

        if (user) {
            ctx.menu.nav('backToUserMain');
            await ctx.editMessageText(MSG.user.subscription(user));
        } else {
            await ctx.editMessageText(MSG.errors.unknownError);
        }
    })
    .text(MSG.buttons.user.notifications, async (ctx) => {
        const {
            user: { id },
        } = await ctx.getAuthor();
        try {
            const user = await getUserById(id);

            ctx.menu.nav('notificationsMenu');
            await ctx.editMessageText(MSG.user.notification.main(user));
        } catch (err) {
            LOGGER.error('[NotificationsMenu][error]', { metadata: { err } });
        }
    })
    .row()
    .text(MSG.buttons.user.paymentDetails, async (ctx) => {
        ctx.menu.nav('backToUserMain');
        await ctx.editMessageText(MSG.payments.static);
    });

userMenu.register(backToUserMain);
userMenu.register(notificationsMenu);

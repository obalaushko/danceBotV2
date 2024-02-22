import { Menu } from '@grammyjs/menu';
import { MSG, ROLES } from '../../../constants/index.js';
import { backToUserMain } from './backToMainMenu.js';
import {
    getUserById,
    getUserWithSubscriptionById,
} from '../../../mongodb/operations/index.js';
import { notificationsMenu } from './notificationsMenu.js';
import { LOGGER } from '../../../logger/index.js';
import { freezeSubscriptionMenu } from './freezeSubscription.js';
import { returnToGroupMenu } from './returnToGroupMenu.js';

export const userMenu = new Menu('user')
    .text(MSG.buttons.user.showSubscription, async (ctx) => {
        const {
            user: { id, username },
        } = await ctx.getAuthor();

        LOGGER.debug('[userMenu][showSubscription]', {
            metadata: { id, username },
        });

        const user = await getUserWithSubscriptionById(id);

        if (user) {
            if (user.role === ROLES.Inactive) {
                ctx.menu.nav('returnToGroupMenu');
                await ctx.editMessageText(MSG.deactivatedAccount);
                return;
            }
            if (user.subscription?.active) {
                ctx.menu.nav('freezeSubscriptionMenu');
            } else {
                if (user.subscription?.freeze?.active) {
                    ctx.menu.nav('freezeSubscriptionMenu');
                } else {
                    ctx.menu.nav('backToUserMain');
                }
            }
            await ctx.editMessageText(MSG.user.subscription(user));
        } else {
            await ctx.editMessageText(MSG.errors.unknownError);
        }
    })
    .text(MSG.buttons.user.notifications, async (ctx) => {
        const {
            user: { id, username },
        } = await ctx.getAuthor();
        try {
            LOGGER.debug('[NotificationsMenu]', { metadata: { id, username } });
            const user = await getUserById(id);

            ctx.menu.nav('notificationsMenu');
            await ctx.editMessageText(MSG.user.notification.main(user));
        } catch (err) {
            LOGGER.error('[NotificationsMenu][error]', { metadata: { err } });
        }
    })
    .row()
    .text(MSG.buttons.user.paymentDetails, async (ctx) => {
        const {
            user: { id, username },
        } = await ctx.getAuthor();

        LOGGER.debug('[userMenu][paymentDetails]', {
            metadata: { id, username },
        });

        ctx.menu.nav('backToUserMain');
        await ctx.editMessageText(MSG.payments.static);
    });

userMenu.register(backToUserMain);
userMenu.register(freezeSubscriptionMenu);
userMenu.register(notificationsMenu);
userMenu.register(returnToGroupMenu);

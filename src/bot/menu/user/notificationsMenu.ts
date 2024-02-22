import { Menu } from '@grammyjs/menu';
import { MSG } from '../../../constants/index.js';
import {
    getUserById,
    updateUserById,
} from '../../../mongodb/operations/index.js';
import { LOGGER } from '../../../logger/index.js';

export const notificationsMenu = new Menu('notificationsMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
})
    .text(MSG.buttons.user.notificationActivate, async (ctx) => {
        const {
            user: { id, username },
        } = await ctx.getAuthor();

        LOGGER.debug('[NotificationsMenu][notificationActivate]', {
            metadata: { id, username },
        });

        const user = await getUserById(id);

        if (user?.notifications) return;

        const updateUser = await updateUserById(id, { notifications: true }); // enable

        if (updateUser) {
            await ctx.editMessageText(MSG.user.notification.main(updateUser));
        }
    })
    .text(MSG.buttons.user.notificationDisabled, async (ctx) => {
        const {
            user: { id, username },
        } = await ctx.getAuthor();

        LOGGER.debug('[NotificationsMenu][notificationDisabled]', {
            metadata: { id, username },
        });

        const user = await getUserById(id);

        if (!user?.notifications) return;

        const updateUser = await updateUserById(id, { notifications: false }); // disable

        if (updateUser) {
            await ctx.editMessageText(MSG.user.notification.main(updateUser));
        }
    })
    .row()
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.back();
        await ctx.editMessageText(MSG.welcome.user(user));
    });

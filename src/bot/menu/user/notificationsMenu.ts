import { Menu, MenuRange } from '@grammyjs/menu';
import { MSG } from '../../../constants/index.js';
import {
    getUserById,
    updateUserById,
} from '../../../mongodb/operations/index.js';
import { LOGGER } from '../../../logger/index.js';

export const notificationsMenu = new Menu('notificationsMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
})
    .dynamic(async (ctx) => {
        try {
            const {
                user: { id },
            } = await ctx.getAuthor();

            const range = new MenuRange();

            const user = await getUserById(id);

            const notificationStatus = user?.notifications || false;
            const buttonText = notificationStatus
                ? MSG.buttons.user.notificationDisabled
                : MSG.buttons.user.notificationActivate;

            range.text(
                {
                    text: buttonText,
                },
                async (ctx) => {
                    const updateUser = await updateUserById(id, {
                        notifications: !notificationStatus,
                    });
                    if (updateUser) {
                        await ctx.editMessageText(
                            MSG.user.notification.main(updateUser)
                        );
                    } else {
                        await ctx.editMessageText(MSG.errors.unknownError);
                    }
                }
            );

            return range;
        } catch (error) {
            LOGGER.error('[notificationsMenu] Error', { metadata: error });
        }
    })
    .row()
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.back();
        await ctx.editMessageText(MSG.welcome.user(user));
    });

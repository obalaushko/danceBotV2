import { Menu, MenuRange } from '@grammyjs/menu';
import { MSG } from '../../../constants/index.js';
import { LOGGER } from '../../../logger/index.js';
import {
    getAllUsers,
    getUserWithSubscriptionById,
} from '../../../mongodb/operations/users.js';
import { setupUserMenu } from './userSetupMenu.js';
import { SessionContext } from '../../types/index.js';
import {
    getGroupedSubscriptionChangeLogs,
    getGroupedSubscriptionChanges,
} from '../../../mongodb/operations/changeLog.js';

// Users menu
const settingUserMenu = new Menu<SessionContext>('settingUserMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
})
    .dynamic(async () => {
        try {
            const users = await getAllUsers();

            const range = new MenuRange<SessionContext>();
            if (users?.length) {
                users.map((user, index) => {
                    range.text(
                        {
                            text: user.fullName!,
                            payload: user.userId.toString(),
                        },
                        async (ctx) => {
                            try {
                                const userId = Number(ctx.match);
                                const user =
                                    await getUserWithSubscriptionById(userId);

                                if (user) {
                                    ctx.menu.nav('setupUserMenu');
                                    await ctx.editMessageText(
                                        MSG.settings.setupUser(user)
                                    );
                                    ctx.session.editedUserId = userId;
                                } else {
                                    throw new Error('User not found!');
                                }
                            } catch (err) {
                                LOGGER.error('[setupUserMenu]', {
                                    metadata: err,
                                });
                            }
                        }
                    );
                    if (index % 2) range.row();
                });
            }

            return range;
        } catch (err) {
            LOGGER.error('[SettingUser]', { metadata: err });
        }
    })
    .row()
    .text(MSG.buttons.back, async (ctx) => {
        ctx.menu.back();
        await ctx.editMessageText(MSG.settings.main);
    })
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.nav('admin');
        await ctx.editMessageText(MSG.welcome.admin(user));
    });
// SubMenu
settingUserMenu.register(setupUserMenu as any);

// Bot menu
const settingHistoryMenu = new Menu('settingHistoryMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
})
    .row()
    .text(MSG.buttons.back, async (ctx) => {
        ctx.menu.back();
        await ctx.editMessageText(MSG.settings.main);
    })
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.nav('admin');
        await ctx.editMessageText(MSG.welcome.admin(user));
    });

// Main menu
export const settingsMenu = new Menu('settingsMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
})
    .text(MSG.buttons.settings.users, async (ctx) => {
        ctx.menu.nav('settingUserMenu');
        await ctx.editMessageText(MSG.settings.users);
    })
    .text(MSG.buttons.settings.history, async (ctx) => {
        const history = await getGroupedSubscriptionChanges();

        ctx.menu.nav('settingHistoryMenu');
        await ctx.editMessageText(MSG.settings.history(history));
    })
    .row()
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.back();
        await ctx.editMessageText(MSG.welcome.admin(user));
    });

settingsMenu.register(settingUserMenu as any);
settingsMenu.register(settingHistoryMenu);

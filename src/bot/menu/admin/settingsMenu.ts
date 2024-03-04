import { Menu, MenuRange } from '@grammyjs/menu';
import { MSG } from '../../../constants/index.js';
import { LOGGER } from '../../../logger/index.js';
import {
    getAllUsers,
    getUserWithSubscriptionById,
} from '../../../mongodb/operations/users.js';
import { setupUserMenu } from './userSetupMenu.js';
import { SessionContext } from '../../types/index.js';
import { getGroupedSubscriptionChanges } from '../../../mongodb/operations/changeLog.js';
import { sendMailingToUsers } from '../../../helpers/notifications.js';
import { ENV_VARIABLES } from '../../../constants/global.js';

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

// History menu
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

const confirmMailingMenu = new Menu('confirmMailingMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
})
    .text(MSG.buttons.send, async (ctx) => {
        await sendMailingToUsers(MSG.payments.updatedStatic);
        ctx.menu.back();
        await ctx.editMessageText(MSG.settings.mailing.main);
    })
    .text(MSG.buttons.cancel, async (ctx) => {
        ctx.menu.back();
        await ctx.editMessageText(MSG.settings.mailing.main);
    });

// Mailing menu
const mailingMenu = new Menu('mailingMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
})
    .text(MSG.buttons.settings.mailing.custom, async (ctx) => {
        // ctx.menu.nav('confirmMailingMenu');
        ctx.menu.close();
        await ctx.editMessageText(MSG.settings.mailing.custom);
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
mailingMenu.register(confirmMailingMenu);

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
    // .row()
    // .text(MSG.buttons.settings.mailing.main, async (ctx) => {
    //     ctx.menu.nav('mailingMenu');
    //     await ctx.editMessageText(MSG.settings.mailing.main);
    // })
    .row()
    .webApp('settings', ENV_VARIABLES.URL + 'settings')
    .webApp('history', ENV_VARIABLES.URL + 'history')
    .row()
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.back();
        await ctx.editMessageText(MSG.welcome.admin(user));
    });

settingsMenu.register(settingUserMenu as any);
settingsMenu.register(settingHistoryMenu);
settingsMenu.register(mailingMenu);

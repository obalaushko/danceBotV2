import { Menu, MenuRange } from '@grammyjs/menu';
import { MSG } from '../../../constants/index.js';
import { LOGGER } from '../../../logger/index.js';
import {
    deactivateSubscriptions,
    deleteSubscription,
    deleteUsers,
    getAllCanBeDeletedUsers,
    getAllCanBeSetIncactiveUsers,
    getUsersByUserIds,
    updateUsersToInactive,
} from '../../../mongodb/operations/index.js';
import { removeUserFromGroup } from '../../../helpers/index.js';

const checkedInactive = new Set<number>();

const toggleCheckedInactive = (id: number) => {
    if (!checkedInactive.delete(id)) checkedInactive.add(id);
};

const checkedRemove = new Set<number>();

const toggleCheckedRemove = (id: number) => {
    if (!checkedRemove.delete(id)) checkedRemove.add(id);
};

const confirmRemoveMenu = new Menu('confirmRemoveMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
})
    .text(MSG.buttons.removed.remove, async (ctx) => {
        const userIds = [...checkedRemove];
        const { user } = await ctx.getAuthor();

        const removedUsers = await deleteUsers(userIds, user.id);

        if (removedUsers) {
            LOGGER.info('[Removed]', {
                metadata: userIds,
            });
            checkedRemove.clear();

            await deleteSubscription(userIds);

            await removeUserFromGroup(userIds);

            ctx.menu.nav('admin');
            await ctx.editMessageText(MSG.welcome.admin(user));
        } else {
            LOGGER.error('[Removed]', {
                metadata: removedUsers,
            });
            await ctx.reply(MSG.errors.failedToRemove);
        }
    })
    .text(MSG.buttons.back, async (ctx) => {
        ctx.menu.back();
        await ctx.editMessageText(MSG.remove.permanentlyRemove(null));
        checkedInactive.clear();
    });

const inactiveMenu = new Menu('inactiveMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
})
    .dynamic(async () => {
        const users = await getAllCanBeSetIncactiveUsers();

        const range = new MenuRange();
        if (users?.length) {
            users.map((user, index) => {
                range.text(
                    {
                        text: checkedInactive.has(user.userId)
                            ? `✔️ ${user.fullName!}`
                            : user.fullName!,
                        payload: user.userId.toString(),
                    },
                    (ctx) => {
                        toggleCheckedInactive(Number(ctx.match));

                        ctx.menu.update();
                    }
                );
                if (index % 2) range.row();
            });
            checkedInactive.size &&
                range.row().text(MSG.buttons.update, async (ctx) => {
                    const userIds = [...checkedInactive];

                    const updateUsers = await updateUsersToInactive(userIds);

                    checkedInactive.clear();
                    if (updateUsers?.length) {
                        LOGGER.info('[Inactive]', {
                            metadata: updateUsers,
                        });

                        await deactivateSubscriptions(userIds);

                        await removeUserFromGroup(userIds);

                        ctx.menu.update();
                        await ctx.editMessageText(
                            MSG.remove.inactive(updateUsers)
                        );
                    } else {
                        LOGGER.error('[Inactive]', {
                            metadata: updateUsers,
                        });
                        await ctx.reply(MSG.errors.failedToUpdate);
                    }
                });
        }

        return range;
    })
    .row()
    .text(MSG.buttons.back, async (ctx) => {
        ctx.menu.back();
        await ctx.editMessageText(MSG.remove.main);
        checkedInactive.clear();
    })
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.nav('admin');
        await ctx.editMessageText(MSG.welcome.admin(user));
        checkedRemove.clear();
    });

const removeMenu = new Menu('removeMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
})
    .dynamic(async () => {
        const users = await getAllCanBeDeletedUsers();

        const range = new MenuRange();
        if (users?.length) {
            users.map((user, index) => {
                range.text(
                    {
                        text: checkedRemove.has(user.userId)
                            ? `✔️ ${user.fullName!}`
                            : user.fullName!,
                        payload: user.userId.toString(),
                    },
                    (ctx) => {
                        toggleCheckedRemove(Number(ctx.match));

                        ctx.menu.update();
                    }
                );
                if (index % 2) range.row();
            });
            checkedRemove.size &&
                range.row().text(MSG.buttons.update, async (ctx) => {
                    const userIds = [...checkedRemove];
                    const users = await getUsersByUserIds(userIds);
                    if (users?.length) {
                        ctx.menu.nav('confirmRemoveMenu');
                        await ctx.editMessageText(
                            MSG.remove.confirmRemoved(users)
                        );
                    } else {
                        await ctx.editMessageText(MSG.errors.failedToRemove);
                    }
                });
        }

        return range;
    })
    .row()
    .text(MSG.buttons.back, async (ctx) => {
        ctx.menu.back();
        await ctx.editMessageText(MSG.remove.main);
        checkedRemove.clear();
    })
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.nav('admin');
        await ctx.editMessageText(MSG.welcome.admin(user));
        checkedRemove.clear();
    });

removeMenu.register(confirmRemoveMenu);

// Main menu
export const removeUserMenu = new Menu('removeUserMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
})
    .text(MSG.buttons.removed.inactive, async (ctx) => {
        ctx.menu.nav('inactiveMenu');
        await ctx.editMessageText(MSG.remove.inactive(null));
    })
    .text(MSG.buttons.removed.remove, async (ctx) => {
        ctx.menu.nav('removeMenu');
        await ctx.editMessageText(MSG.remove.permanentlyRemove(null));
    })
    .row()
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.back();
        await ctx.editMessageText(MSG.welcome.admin(user));
    });

removeUserMenu.register(inactiveMenu);
removeUserMenu.register(removeMenu);

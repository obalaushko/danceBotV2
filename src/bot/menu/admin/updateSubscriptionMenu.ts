import { Menu, MenuRange } from '@grammyjs/menu';
import { MSG } from '../../../constants';
import {
    activateSubscriptions,
    deactivateSubscriptions,
    getAllActiveUserUsers,
    getAllDeactiveUserUsers,
} from '../../../mongodb/operations';
import { LOGGER } from '../../../logger';

export const updateSubscriptionMenu = new Menu('updateSubscriptionMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
});

const activateSubscriptionMenu = new Menu('activateSubscriptionMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
});

const deactivateSubscriptionMenu = new Menu('deactivateSubscriptionMenu', {
    onMenuOutdated: MSG.onMenuOutdated,
});

const checkedActive = new Set<number>();

const toggleCheckedActive = (id: number) => {
    if (!checkedActive.delete(id)) checkedActive.add(id);
};

const checkedDeactive = new Set<number>();

const toggleCheckedDeactive = (id: number) => {
    if (!checkedDeactive.delete(id)) checkedDeactive.add(id);
};

activateSubscriptionMenu
    .dynamic(async () => {
        const users = await getAllDeactiveUserUsers();

        const range = new MenuRange();
        if (users?.length) {
            users.map((user) => {
                range
                    .text(
                        {
                            text: checkedActive.has(user.userId)
                                ? `${user.fullName!} ✔️`
                                : user.fullName!,
                            payload: user.userId.toString(),
                        },
                        (ctx) => {
                            toggleCheckedActive(Number(ctx.match));

                            ctx.menu.update();
                        }
                    )
                    .row();
            });
            checkedActive.size && range.text(MSG.buttons.update, async (ctx) => {
                const userIds = [...checkedActive];

                const updateSubscriptions =
                    await activateSubscriptions(userIds);

                checkedActive.clear();
                if (updateSubscriptions?.length) {
                    LOGGER.info('[activateSubscriptions]', {
                        metadata: updateSubscriptions,
                    });
                    ctx.menu.update();
                } else {
                    LOGGER.error('[activateSubscriptions]', {
                        metadata: updateSubscriptions,
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
        await ctx.editMessageText(MSG.chooseSubscriptionsActions);
        checkedActive.clear();
    })
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.nav('admin');
        await ctx.editMessageText(MSG.welcome.admin(user));
        checkedActive.clear();
    });

deactivateSubscriptionMenu
    .dynamic(async () => {
        const users = await getAllActiveUserUsers();

        const range = new MenuRange();
        if (users?.length) {
            users.map((user) => {
                range
                    .text(
                        {
                            text: checkedDeactive.has(user.userId)
                                ? `${user.fullName!} ✔️`
                                : user.fullName!,
                            payload: user.userId.toString(),
                        },
                        (ctx) => {
                            toggleCheckedDeactive(Number(ctx.match));

                            ctx.menu.update();
                        }
                    )
                    .row();
            });

            checkedDeactive.size && range.text(MSG.buttons.update, async (ctx) => {
                const userIds = [...checkedDeactive];

                const updateSubscriptions =
                    await deactivateSubscriptions(userIds);

                checkedDeactive.clear();
                if (updateSubscriptions?.length) {
                    LOGGER.info('[deactivateSubscriptions]', {
                        metadata: updateSubscriptions,
                    });
                    ctx.menu.update();
                } else {
                    LOGGER.error('[deactivateSubscriptions]', {
                        metadata: updateSubscriptions,
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
        await ctx.editMessageText(MSG.chooseSubscriptionsActions);
        checkedDeactive.clear();
    })
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.nav('admin');
        await ctx.editMessageText(MSG.welcome.admin(user));
        checkedDeactive.clear();
    });

updateSubscriptionMenu
    .text(MSG.buttons.updateSubscription.activate, async (ctx) => {
        ctx.menu.nav('activateSubscriptionMenu');
        await ctx.editMessageText(MSG.chooseUserToActivatedSubscription);
    })
    .text(MSG.buttons.updateSubscription.deactivate, async (ctx) => {
        ctx.menu.nav('deactivateSubscriptionMenu');
        await ctx.editMessageText(MSG.chooseUserToDeactivatedSubscription);
    })
    .row()
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.back();
        await ctx.editMessageText(MSG.welcome.admin(user));
    });

updateSubscriptionMenu.register(deactivateSubscriptionMenu);
updateSubscriptionMenu.register(activateSubscriptionMenu);

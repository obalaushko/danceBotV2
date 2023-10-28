import { Menu, MenuRange } from '@grammyjs/menu';
import { MSG } from '../../../constants';
import {
    activateSubscriptions,
    deactivateSubscriptions,
    getAllActiveUserUsers,
    getAllDeactiveUserUsers,
} from '../../../mongodb/operations';

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
            range.text(MSG.buttons.update, async (ctx) => {
                const userIds = [...checkedActive];

                const updateSubscriptions =
                    await activateSubscriptions(userIds);

                if (updateSubscriptions?.length) {
                    ctx.menu.update();
                } else {
                    await ctx.reply(MSG.errors.failedToUpdate);
                }
            });
        }

        return range;
    })
    .text(MSG.buttons.back, async (ctx) => {
        ctx.menu.back();
        await ctx.editMessageText(MSG.chooseSubscriptionsActions);
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
            range.text(MSG.buttons.update, async (ctx) => {
                const userIds = [...checkedDeactive];

                const updateSubscriptions =
                    await deactivateSubscriptions(userIds);

                if (updateSubscriptions?.length) {
                    ctx.menu.update();
                } else {
                    await ctx.reply(MSG.errors.failedToUpdate);
                }
            });
        }

        return range;
    })
    .text(MSG.buttons.back, async (ctx) => {
        ctx.menu.back();
        await ctx.editMessageText(MSG.chooseSubscriptionsActions);
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

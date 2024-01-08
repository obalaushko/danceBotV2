import { Menu, MenuRange } from '@grammyjs/menu';
import { MSG } from '../../../constants/messages.js';
import { getUserWithSubscriptionById, getUserById } from '../../../mongodb/operations/users.js';
import {
    defrostSubscriptionByUserId,
    freezeSubscriptionByUserId,
    getSubscriptionById,
} from '../../../mongodb/operations/subscriptions.js';
import { checkLastFreeze } from '../../../utils/utils.js';

import * as dotenv from 'dotenv';
dotenv.config();

const ENVS = process.env;
const ADMIN_ID = ENVS.ADMIN_ID || '';

const freezeSubMenu = new Menu('freezeSubMenu')
    .dynamic(async (ctx) => {
        const {
            user: { id },
        } = await ctx.getAuthor();
        const user = await getUserWithSubscriptionById(id);
        const range = new MenuRange();

        const frozen = user?.subscription?.freeze?.active || false;

        if (user) {
            range.text(
                {
                    text: MSG.buttons.user.freezeApprove(frozen),
                },
                async (ctx) => {
                    if (frozen) {
                        const defrost = await defrostSubscriptionByUserId(id);
                        if (defrost) {
                            const user = await getUserWithSubscriptionById(id);
                            if (user) {
                                if (user.subscription?.active) {
                                    ctx.menu.nav('freezeSubscriptionMenu');
                                } else {
                                    if (user.subscription?.freeze?.active) {
                                        ctx.menu.nav('freezeSubscriptionMenu');
                                    } else {
                                        ctx.menu.nav('backToUserMain');
                                    }
                                }
                                await ctx.editMessageText(
                                    MSG.user.subscription(user)
                                );
                            } else {
                                await ctx.editMessageText(
                                    MSG.errors.unknownError
                                );
                            }
                        }
                    } else {
                        const freeze = await freezeSubscriptionByUserId(id);
                        if (freeze) {
                            ctx.menu.update();
                            await ctx.editMessageText(
                                MSG.user.freeze.frozen(freeze)
                            );

                            const user = await getUserById(freeze.userId);
                            if (user) {
                                await ctx.api.sendMessage(
                                    ADMIN_ID,
                                    MSG.frozenUser(user)
                                );
                            }
                        }
                    }
                }
            );
        }
        return range;
    })

    .row()
    .text(MSG.buttons.back, async (ctx) => {
        const {
            user: { id },
        } = await ctx.getAuthor();
        const user = await getUserWithSubscriptionById(id);
        ctx.menu.back();
        if (user) {
            await ctx.editMessageText(MSG.user.subscription(user));
        } else {
            await ctx.editMessageText(MSG.errors.unknownError);
        }
    })
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.nav('user');
        await ctx.editMessageText(MSG.welcome.user(user));
    });

export const freezeSubscriptionMenu = new Menu('freezeSubscriptionMenu')
    .dynamic(async (ctx) => {
        const { user } = await ctx.getAuthor();
        const range = new MenuRange();
        const subscription = await getSubscriptionById(user.id);
        if (subscription) {
            range.text(
                subscription?.freeze?.active
                    ? MSG.buttons.user.defrostSubscription
                    : MSG.buttons.user.freezeSubscription,
                async (ctx) => {
                    if (subscription?.freeze?.active) {
                        await ctx.editMessageText(
                            MSG.user.freeze.frozen(subscription)
                        );
                        ctx.menu.nav('freezeSubMenu');
                    } else {
                        if (
                            checkLastFreeze(
                                subscription?.freeze?.lastDateFreeze
                            )
                        ) {
                            ctx.menu.nav('freezeSubMenu');
                            await ctx.editMessageText(MSG.user.freeze.main);
                        } else {
                            ctx.menu.nav('backToUserMain');
                            await ctx.editMessageText(
                                MSG.user.freeze.isNotAllowed(subscription)
                            );
                        }
                    }
                }
            );
        }
        return range;
    })
    .row()
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.nav('user');
        await ctx.editMessageText(MSG.welcome.user(user));
    });

freezeSubscriptionMenu.register(freezeSubMenu);

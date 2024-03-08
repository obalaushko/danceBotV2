import { ENV_VARIABLES } from './../../../constants/global';
import { Menu, MenuRange } from '@grammyjs/menu';
import { MSG } from '../../../constants/messages.js';
import {
    getUserWithSubscriptionById,
    getUserById,
} from '../../../mongodb/operations/users.js';
import {
    defrostSubscriptionByUserId,
    freezeSubscriptionByUserId,
    getSubscriptionById,
} from '../../../mongodb/operations/subscriptions.js';
import { checkLastFreeze } from '../../../utils/utils.js';

import { LOGGER } from '../../../logger/index.js';
import { generateQR } from '../../../utils/generateQR.js';
import { InputFile } from 'grammy';
import { backAfterQRMenu } from './backAfterQRMenu.js';

const freezeSubMenu = new Menu('freezeSubMenu')
    .dynamic(async (ctx) => {
        const {
            user: { id, username },
        } = await ctx.getAuthor();
        LOGGER.debug('[freezeSubMenu]', { metadata: { id, username } });

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
                                    ctx.menu.nav('subscriptionMenu');
                                } else {
                                    if (user.subscription?.freeze?.active) {
                                        ctx.menu.nav('subscriptionMenu');
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
                                    ENV_VARIABLES.ADMIN_ID,
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

export const subscriptionMenu = new Menu('subscriptionMenu')
    .dynamic(async (ctx) => {
        try {
            const { user } = await ctx.getAuthor();
            const range = new MenuRange();
            const subscription = await getSubscriptionById(user.id);
            if (subscription) {
                const userWithSubscription = await getUserWithSubscriptionById(
                    user.id
                );

                if (userWithSubscription?.subscription?.active) {
                    range.text(MSG.buttons.user.qr, async (ctx) => {
                        const userInfo = {
                            id: userWithSubscription?.userId,
                            username: userWithSubscription?.username || null,
                            fullName: userWithSubscription?.fullName,
                        };

                        // Generate string for parsing tg qr scanner
                        const data = `userId:${userInfo.id},username:${userInfo.username},fullName:${userInfo.fullName}`;

                        const qr = await generateQR(data);

                        if (qr) {
                            await ctx.deleteMessage();

                            const photo = new InputFile(qr, 'qrcode.png');
                            await ctx.replyWithPhoto(photo, {
                                caption: 'Покажіть QR викладачу.',
                                reply_markup: backAfterQRMenu,
                            });
                        }
                    });
                }

                range.row();

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

                return range;
            }
        } catch (error: any) {
            LOGGER.warn('[userMenu][qr]', { metadata: { error } });
        }
    })
    .row()
    .text(MSG.buttons.backToMain, async (ctx) => {
        const { user } = await ctx.getAuthor();
        ctx.menu.nav('user');
        await ctx.editMessageText(MSG.welcome.user(user));
    });

subscriptionMenu.register(freezeSubMenu);

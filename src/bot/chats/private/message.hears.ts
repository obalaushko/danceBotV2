import { MSG } from '../../../constants/messages.js';
import { privateChat } from '../../bot.js';
import { updateUserById } from '../../../mongodb/operations/users.js';
import { adminMenu } from '../../menu/index.js';
import { BotContext } from '../../types/index.js';
import { updateSubscriptionById } from '../../../mongodb/operations/subscriptions.js';
import { ROLES } from '../../../constants/global.js';

/**
 * Handles various message hears in private chats.
 */
export const messageHears = () => {
    /**
     * Updates the role of a user.
     * @param userId - The ID of the user.
     * @param role - The new role for the user.
     * @returns A promise that resolves to a string indicating the result of the update operation.
     */
    const handlerUpdateRole = async (
        userId: number,
        role: string
    ): Promise<string> => {
        const updatedUser = await updateUserById(userId, { role });

        if (updatedUser) {
            return MSG.settings.updateRole.success(updatedUser);
        } else {
            return MSG.errors.failedToUpdate;
        }
    };

    /**
     * Updates the notification settings for a user.
     *
     * @param userId - The ID of the user.
     * @param notifications - The new notification setting.
     * @returns A promise that resolves to a string indicating the result of the update.
     */
    const handlerUpdateNotifications = async (
        userId: number,
        notifications: boolean
    ): Promise<string> => {
        const updatedUser = await updateUserById(userId, { notifications });

        if (updatedUser) {
            return MSG.settings.updateNotifications.success(updatedUser);
        } else {
            return MSG.errors.failedToUpdate;
        }
    };

    /**
     * Updates the total number of lessons for a user.
     *
     * @param userId - The ID of the user.
     * @param totalLessons - The new total number of lessons.
     * @returns A promise that resolves to a string indicating the result of the update.
     */
    const handlerUpdateTotalLessons = async (
        userId: number,
        totalLessons: number
    ): Promise<string> => {
        const updatedSubscriptions = await updateSubscriptionById(userId, {
            totalLessons,
        });

        if (updatedSubscriptions) {
            return MSG.settings.totalLessons.success(updatedSubscriptions);
        } else {
            return MSG.errors.failedToUpdate;
        }
    };

    /**
     * Updates the number of used lessons for a user.
     *
     * @param userId - The ID of the user.
     * @param usedLessons - The number of used lessons to update.
     * @returns A promise that resolves to a string indicating the success or failure of the update.
     */
    const handlerUpdateUsedLessons = async (
        userId: number,
        usedLessons: number
    ): Promise<string> => {
        const updatedSubscriptions = await updateSubscriptionById(userId, {
            usedLessons,
        });

        if (updatedSubscriptions) {
            return MSG.settings.usedLessons.success(updatedSubscriptions);
        } else {
            return MSG.errors.failedToUpdate;
        }
    };

    /**
     * Handles role switching based on the received message.
     *
     * @param ctx - The BotContext object.
     * @param message - The message received.
     * @param userId - The ID of the user.
     */
    const roleSwitch = async (
        ctx: BotContext,
        message: string,
        userId: number
    ) => {
        const { user } = await ctx.getAuthor();
        switch (message) {
            case MSG.buttons.cancel:
                await ctx.reply(MSG.cancelEdit, {
                    reply_markup: { remove_keyboard: true },
                });
                await ctx.reply(MSG.welcome.admin(user), {
                    reply_markup: adminMenu,
                });
                break;
            case MSG.buttons.developer.guest:
                await ctx.reply(await handlerUpdateRole(userId, ROLES.Guest), {
                    reply_markup: { remove_keyboard: true },
                });
                await ctx.reply(MSG.welcome.admin(user), {
                    reply_markup: adminMenu,
                });
                break;
            case MSG.buttons.developer.user:
                await ctx.reply(await handlerUpdateRole(userId, ROLES.User), {
                    reply_markup: { remove_keyboard: true },
                });
                await ctx.reply(MSG.welcome.admin(user), {
                    reply_markup: adminMenu,
                });
                break;
            case MSG.buttons.developer.inactive:
                await ctx.reply(
                    await handlerUpdateRole(userId, ROLES.Inactive),
                    {
                        reply_markup: { remove_keyboard: true },
                    }
                );
                await ctx.reply(MSG.welcome.admin(user), {
                    reply_markup: adminMenu,
                });
                break;
            case MSG.buttons.developer.admin:
                await ctx.reply(await handlerUpdateRole(userId, ROLES.Admin), {
                    reply_markup: { remove_keyboard: true },
                });
                await ctx.reply(MSG.welcome.admin(user), {
                    reply_markup: adminMenu,
                });
                break;
            default:
                await ctx.reply(MSG.settings.setup.cancel, {
                    reply_markup: { remove_keyboard: true },
                });
                break;
        }
    };

    /**
     * Handles the notification switch based on the received message.
     * @param ctx The bot context.
     * @param message The received message.
     * @param userId The user ID.
     */
    const notificationSwitch = async (
        ctx: BotContext,
        message: string,
        userId: number
    ) => {
        const { user } = await ctx.getAuthor();
        switch (message) {
            case MSG.buttons.cancel:
                await ctx.reply(MSG.cancelEdit, {
                    reply_markup: { remove_keyboard: true },
                });
                await ctx.reply(MSG.welcome.admin(user), {
                    reply_markup: adminMenu,
                });
                break;
            case MSG.buttons.user.notificationActivate:
                await ctx.reply(
                    await handlerUpdateNotifications(userId, true),
                    {
                        reply_markup: { remove_keyboard: true },
                    }
                );
                await ctx.reply(MSG.welcome.admin(user), {
                    reply_markup: adminMenu,
                });
                break;
            case MSG.buttons.user.notificationDisabled:
                await ctx.reply(
                    await handlerUpdateNotifications(userId, false),
                    {
                        reply_markup: { remove_keyboard: true },
                    }
                );
                await ctx.reply(MSG.welcome.admin(user), {
                    reply_markup: adminMenu,
                });
                break;
        }
    };
    /**
     * Handles the switch cases for the lessons in a private message.
     * @param ctx The BotContext object.
     * @param message The message string.
     * @param userId The user ID.
     * @param action The action string.
     */
    const lessonsSwitch = async (
        ctx: BotContext,
        message: string,
        userId: number,
        action: string
    ) => {
        const { user } = await ctx.getAuthor();
        switch (message) {
            case MSG.buttons.cancel:
                await ctx.reply(MSG.cancelEdit, {
                    reply_markup: { remove_keyboard: true },
                });
                await ctx.reply(MSG.welcome.admin(user), {
                    reply_markup: adminMenu,
                });
                break;
            case MSG.buttons.settings.lessons[1]:
            case MSG.buttons.settings.lessons[2]:
            case MSG.buttons.settings.lessons[3]:
            case MSG.buttons.settings.lessons[4]:
            case MSG.buttons.settings.lessons[5]:
            case MSG.buttons.settings.lessons[6]:
            case MSG.buttons.settings.lessons[7]:
            case MSG.buttons.settings.lessons[8]:
                if (action === 'TotalLessons') {
                    await ctx.reply(
                        await handlerUpdateTotalLessons(
                            userId,
                            Number(message)
                        ),
                        {
                            reply_markup: { remove_keyboard: true },
                        }
                    );
                } else if (action === 'UsedLessons') {
                    await ctx.reply(
                        await handlerUpdateUsedLessons(userId, Number(message)),
                        {
                            reply_markup: { remove_keyboard: true },
                        }
                    );
                }
                await ctx.reply(MSG.welcome.admin(user), {
                    reply_markup: adminMenu,
                });
                break;
        }
    };

    privateChat.on('message:text').filter(
        async (ctx) => {
            if (ctx.session.editedUserId) {
                return true;
            } else return false;
        },
        async (ctx) => {
            const userId = ctx.session.editedUserId;
            const action = ctx.session.editedActions;
            const message = ctx.message.text;

            if (!userId || !action) return;

            switch (action) {
                case 'Role':
                    await roleSwitch(ctx, message, userId);
                    break;
                case 'Notifications':
                    await notificationSwitch(ctx, message, userId);
                    break;
                case 'TotalLessons':
                case 'UsedLessons':
                    await lessonsSwitch(ctx, message, userId, action);
                    break;
            }

            // clean session
            ctx.session.editedUserId = null;
            ctx.session.editedActions = null;
        }
    );
};

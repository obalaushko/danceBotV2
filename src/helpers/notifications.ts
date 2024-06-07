import { ENV_VARIABLES } from './../constants/global.js';
import { IUser } from './../mongodb/schemas/user.js';
import { bot } from '../bot/bot.js';
import { LOGGER } from '../logger/index.js';
import { getAllUserUsers, getUserById } from '../mongodb/operations/index.js';
import { MSG } from '../constants/index.js';

/**
 * Sends a notification to a user.
 * @param userId - The ID of the user to send the notification to.
 * @param message - The message to be sent as the notification.
 */
export const sendUserNotification = async (userId: number, message: string) => {
    const owner = await getUserById(userId);
    try {
        if (owner && owner.notifications) {
            await bot.api.sendMessage(userId, message);
        }
    } catch (err) {
        LOGGER.error(
            `[sendUserNotification] Failed to write to user. ${userId}`,
            { metadata: err }
        );
    }
};

/**
 * Sends an invite to a group for each user in the provided array.
 * If the user is already a member of the group, a message is sent to the user.
 * If the user is not a member, an invite link is created and sent to the user.
 * @param users - An array of IUser objects representing the users to send invites to.
 */
export const sendInviteToGroup = async (users: IUser[]) => {
    try {
        for (const user of users) {
            const member = await bot.api.getChatMember(
                ENV_VARIABLES.GROUP_ID,
                user.userId
            );

            if (member.status === 'member') {
                await bot.api.sendMessage(
                    user.userId,
                    MSG.alreadyExistsInGroup
                );
            } else {
                const { invite_link } = await bot.api.createChatInviteLink(
                    ENV_VARIABLES.GROUP_ID,
                    {
                        creates_join_request: true,
                    }
                );

                user.inviteLink = invite_link;
                await user.save();

                await bot.api.unbanChatMember(ENV_VARIABLES.GROUP_ID, user.userId, {
                    only_if_banned: true,
                });

                await bot.api.sendMessage(
                    user.userId,
                    MSG.inviteToGroup(invite_link)
                );
            }
        }
    } catch (err) {
        LOGGER.error(`[sendInviteToGroup] Failed to write to user.`, {
            metadata: err,
        });
    }
};

/**
 * Sends a mailing to all users who have notifications enabled.
 * @param messages - The messages to be sent.
 */
export const sendMailingToUsers = async (messages: string) => {
    const users = await getAllUserUsers();

    users &&
        users.forEach(async (user) => {
            try {
                if (user.notifications) {
                    await bot.api.sendMessage(user.userId, messages);
                    LOGGER.info(
                        `[sendMailingToUsers] Success send mailing ${user.userId}`
                    );
                }
            } catch (err) {
                LOGGER.error(
                    `[sendMailingToUsers] Failed to write to user ${user.userId}.`,
                    {
                        metadata: err,
                    }
                );
            }
        });
};

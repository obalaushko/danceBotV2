import { bot } from '../bot/bot.js';
import { ENV_VARIABLES } from '../constants/global.js';

import { LOGGER } from '../logger/index.js';
import { getAllUserUsers } from '../mongodb/operations/users.js';
import { hasAdminOrDevRole } from '../utils/utils.js';

/**
 * Removes users from a group.
 * @requires
 * BOT must be admin in the group
 * @param userIds - An array of user IDs to be removed from the group.
 */
export const removeUserFromGroup = async (userIds: number[]) => {
    for (const id of userIds) {
        try {
            const admin = await hasAdminOrDevRole(id);
            if (admin) return;

            await bot.api.banChatMember(ENV_VARIABLES.GROUP_ID, id);
        } catch (err) {
            LOGGER.error(
                `[removeUserFromGroup] Failed remove from group (${id})`,
                {
                    metadata: err,
                }
            );
        }
    }
};

/**
 * Checks and updates the Telegram user information.
 * Retrieves all users and updates their first name and username if available.
 * Saves the updated user information.
 * @requires
 * BOT must be admin in the group
 */
export const checkAndUpdateTelegramUser = async () => {
    try {
        const users = await getAllUserUsers();
        if (!users?.length) return;

        for (const user of users) {
            const {
                user: { id, first_name, username },
            } = await bot.api.getChatMember(
                ENV_VARIABLES.GROUP_ID,
                user.userId
            );

            if (first_name || username) {
                if (first_name) user.firstName = first_name;
                if (username) user.username = username;
                await user.save();
            } else {
                LOGGER.warn(
                    '[checkAndUpdateTelegramUser] Failed to update user',
                    { metadata: { userId: id, first_name, username } }
                );
            }
        }
    } catch (err) {
        LOGGER.error('[checkAndUpdateTelegramUser]', { metadata: err });
    }
};

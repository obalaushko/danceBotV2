import { bot } from '../bot/bot.js';
import { ENV_VARIABLES } from '../constants/global.js';

import { LOGGER } from '../logger/index.js';
import { UserModel } from '../mongodb/schemas/user.js';

/**
 * Removes users from a group.
 * @requires
 * BOT must be admin in the group
 * @param userIds - An array of user IDs to be removed from the group.
 */
export const removeUserFromGroup = async (userIds: number[]) => {
    const { type } = await bot.api.getChat(ENV_VARIABLES.GROUP_ID);

    userIds.forEach(async (id) => {
        try {
            if (type === 'supergroup') {
                await bot.api.unbanChatMember(ENV_VARIABLES.GROUP_ID, id);
            } else {
                await bot.api.banChatMember(ENV_VARIABLES.GROUP_ID, id);
            }
        } catch (err) {
            LOGGER.error('[removeUserFromGroup] Failed remove from group', {
                metadata: err,
            });
        }
    });
};

/**
 * Checks and updates the Telegram users in the database.
 * Retrieves the users from the UserModel and updates their first name and username
 * based on the information obtained from the Telegram API.
 * If the update is successful, the changes are saved to the database.
 * If the update fails, a warning message is logged.
 * If an error occurs during the process, an error message is logged.
 * @requires
 * BOT must be admin in the group
 */
export const checkAndUpdateTelegramUser = async () => {
    try {
        const users = await UserModel.find();
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

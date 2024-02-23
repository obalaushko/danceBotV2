import { bot } from '../bot/bot.js';

import * as dotenv from 'dotenv';
import { LOGGER } from '../logger/index.js';
import { UserModel } from '../mongodb/schemas/user.js';
import { updateUsersToInactive } from '../mongodb/operations/users.js';
import { ROLES } from '../constants/global.js';
dotenv.config();

const ENVS = process.env;
const GROUP_ID = ENVS.GROUP_ID || '';
//! BOT must be admin in the group
export const removeUserFromGroup = async (
    userIds: number[],
    typeGroup: string = 'supergroup'
) => {
    userIds.forEach(async (id) => {
        try {
            if (typeGroup === 'supergroup') {
                await bot.api.unbanChatMember(GROUP_ID, id);
            } else {
                await bot.api.banChatMember(GROUP_ID, id);
            }
        } catch (err) {
            LOGGER.error('[removeUserFromGroup] Failed remove from group', {
                metadata: err,
            });
        }
    });
};

export const checkAndUpdateTelegramUser = async () => {
    try {
        const users = await UserModel.find();
        for (const user of users) {
            const {
                user: { id, first_name, username },
                status,
            } = await bot.api.getChatMember(GROUP_ID, user.userId);

            if (first_name && username) {
                user.firstName = first_name;
                user.username = username;
                await user.save();
            } else {
                LOGGER.error(
                    '[checkAndUpdateTelegramUser] Failed to update user',
                    { metadata: { first_name, username } }
                );
            }

            if (status === 'left' && user.role !== ROLES.Inactive) {
                await updateUsersToInactive(id);
            }
        }
    } catch (err) {
        LOGGER.error('[checkAndUpdateTelegramUser]', { metadata: err });
    }
};

import { bot } from '../bot/bot.js';

import * as dotenv from 'dotenv';
import { LOGGER } from '../logger/index.js';
import { UserModel } from '../mongodb/schemas/user.js';
dotenv.config();

const ENVS = process.env;
const GROUP_ID = ENVS.GROUP_ID || '';
//! BOT must be admin in the group
export const removeUserFromGroup = async (userIds: number[]) => {
    const { type } = await bot.api.getChat(GROUP_ID);

    userIds.forEach(async (id) => {
        try {
            if (type === 'supergroup') {
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
            } = await bot.api.getChatMember(GROUP_ID, user.userId);

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

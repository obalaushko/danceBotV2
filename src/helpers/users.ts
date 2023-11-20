import { bot } from '../bot/bot.js';

import * as dotenv from 'dotenv';
import { LOGGER } from '../logger/index.js';
dotenv.config();

const ENVS = process.env;
const GROUP_ID = ENVS.GROUP_ID || '';

export const removeUserFromGroup = async (userIds: number[]) => {
    userIds.forEach(async (id) => {
        try {
            await bot.api.unbanChatMember(GROUP_ID, id);
        } catch (err) {
            LOGGER.error('[removeUserFromGroup] Failed remove from group', {
                metadata: err,
            });
        }
    });
};

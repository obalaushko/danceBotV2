import { IUser } from './../mongodb/schemas/user';
import { bot } from '../bot/bot';
import { LOGGER } from '../logger';
import { getUserById } from '../mongodb/operations';
import { MSG } from '../constants';

import * as dotenv from 'dotenv';
dotenv.config();

const ENVS = process.env;
const GROUP_ID = ENVS.GROUP_ID || '';

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

export const sendInviteToGroup = async (users: IUser[]) => {
    try {
        const inviteLink = await bot.api.createChatInviteLink(GROUP_ID, {
            creates_join_request: true,
        });
        for (const user of users) {
            await bot.api.sendMessage(
                user.userId,
                MSG.inviteToGroup(inviteLink.invite_link)
            );
        }
    } catch (err) {
        LOGGER.error(`[sendInviteToGroup] Failed to write to user.`, {
            metadata: err,
        });
    }
};

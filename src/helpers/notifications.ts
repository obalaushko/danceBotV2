import { IUser } from './../mongodb/schemas/user';
import { bot } from '../bot/bot';
import { LOGGER } from '../logger';
import { getUserById } from '../mongodb/operations';
import { MSG } from '../constants';

import * as dotenv from 'dotenv';
import { userMenu } from '../bot/menu';
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
        for (const user of users) {
            const member = await bot.api.getChatMember(GROUP_ID, user.userId);

            if (member.status === 'member') {
                await bot.api.sendMessage(
                    user.userId,
                    MSG.alreadyExistsInGroup
                );
            } else {
                const { invite_link } = await bot.api.createChatInviteLink(
                    GROUP_ID,
                    {
                        creates_join_request: true,
                    }
                );

                user.inviteLink = invite_link;
                await user.save();

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

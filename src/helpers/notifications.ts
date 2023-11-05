import { bot } from '../bot/bot';
import { LOGGER } from '../logger';
import { getUserById } from '../mongodb/operations';

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

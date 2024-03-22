import { LOGGER } from '../../logger/index.js';
import { HistoryModel, IHistory } from '../schemas/history.js';
import { getUserById, getUserByMongoId } from './users.js';

/**
 * Records the history of an action performed by a user.
 * @param historyData - The data for the history record.
 * @returns A Promise that resolves to the created history record, or null if an error occurs.
 */
export const recordHistory = async (historyData: {
    userId: number;
    action: string;
    oldValue?: any;
    newValue?: any;
}): Promise<IHistory | null> => {
    try {
        const { userId, action, oldValue, newValue } = historyData;
        const user = await getUserById(userId);
        if (!user) return null;

        const history = new HistoryModel({
            userId: user.id,
            action,
            oldValue,
            newValue,
        });

        await history.save();

        return history;
    } catch (error: any) {
        LOGGER.error('[recordHistory][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

/**
 * Retrieves the history of a user.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to an array of user history objects.
 */
export const getUserHistory = async (userId: string): Promise<IHistory[]> => {
    try {
        const history = await HistoryModel.find({ userId }).sort({
            timestamp: -1,
        });
        return history;
    } catch (error: any) {
        LOGGER.error('[getUserHistory][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return [];
    }
};

/**
 * Retrieves all history records from the database.
 *
 * @param page - The page number to retrieve (default: 1).
 * @param pageSize - The number of records per page (default: 10).
 * @returns A promise that resolves to an array of history records.
 */
export const getAllHistory = async (
    page: number = 1,
    pageSize: number = 20
): Promise<any[]> => {
    try {
        const skip = (page - 1) * pageSize;
        const history = await HistoryModel.find()
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(pageSize);

        const groupedHistory: Record<string, any[]> = {}; // Об'єкт для групування історії по днях

        // Групуємо історію по днях
        history.forEach((item: IHistory) => {
            const date = item.timestamp.toDateString(); // Отримуємо дату в форматі 'YYYY-MM-DD'
            if (!groupedHistory[date]) {
                groupedHistory[date] = [];
            }
            groupedHistory[date].push(item);
        });

        // Отримуємо інформацію про користувачів та формуємо остаточні дані
        const result = [];
        for (const date in groupedHistory) {
            if (date in groupedHistory) {
                const historyItems = groupedHistory[date];
                const usersInfo = await Promise.all(
                    historyItems.map(async (historyItem: IHistory) => {
                        const user = await getUserByMongoId(historyItem.userId);
                        if (!user) return null;
                        return {
                            user: {
                                userId: user.userId,
                                fullName: user.fullName,
                            },
                            action: historyItem.action,
                            timestamp: historyItem.timestamp,
                        };
                    })
                );
                result.push({
                    date,
                    usersInfo,
                });
            }
        }

        return result;
    } catch (error: any) {
        LOGGER.error('[getAllHistory][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return [];
    }
};

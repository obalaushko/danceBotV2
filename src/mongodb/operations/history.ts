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
export const getUserHistory = async (
    userId: number,
    page: number = 1,
    pageSize: number = 10
): Promise<{ list: any[]; totalPages: number }> => {
    try {
        const user = await getUserById(userId);

        if (!user) return { list: [], totalPages: 0 };

        const skip = (page - 1) * pageSize;
        const history = await HistoryModel.find({ userId: user._id })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(pageSize);

        const groupedHistory: Record<string, any> = {}; // Object for grouping history

        // Group history by date
        history.forEach((item: IHistory) => {
            const date = item.timestamp.toLocaleDateString('uk-UA', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
            if (!groupedHistory[date]) {
                groupedHistory[date] = {
                    user: {
                        userId: item.userId,
                        fullName: '', // If user's name is not needed, this can be removed
                    },
                    historyItems: [],
                };
            }
            groupedHistory[date].historyItems.push({
                action: item.action,
                oldValue: item.oldValue,
                newValue: item.newValue,
                timestamp: item.timestamp,
            });
        });

        // Get user information and form the final data
        const result = [];
        for (const date in groupedHistory) {
            const userData = groupedHistory[date];
            if (user) {
                userData.user.fullName = user.fullName ?? '';
                result.push({
                    date,
                    usersInfo: [userData],
                });
            }
        }
        const totalPages = Math.ceil(result.length / pageSize);
        return { list: result, totalPages };
    } catch (error: any) {
        LOGGER.error('[getUserHistory][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return { list: [], totalPages: 0 };
    }
};

/**
 * Retrieves all history items with pagination and groups them by date and user.
 * @param page - The page number to retrieve (default: 1).
 * @param pageSize - The number of items per page (default: 20).
 * @returns A promise that resolves to an array of grouped history items.
 */
export const getAllHistory = async (
    page: number = 1,
    pageSize: number = 20
): Promise<{ list: any[]; totalPages: number }> => {
    try {
        const skip = (page - 1) * pageSize;
        const history = await HistoryModel.find()
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(pageSize);

        const groupedHistory: Record<string, any> = {}; // Object for grouping history

        // Group history by date and users
        history.forEach((item: IHistory) => {
            const date = item.timestamp.toLocaleDateString('uk-UA', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
            if (!groupedHistory[date]) {
                groupedHistory[date] = {};
            }
            const userIdString = item.userId.toString(); // Convert userId to string
            if (!groupedHistory[date][userIdString]) {
                groupedHistory[date][userIdString] = {
                    user: {
                        userId: item.userId,
                        fullName: '', // If user's name is not needed, this can be removed
                    },
                    historyItems: [],
                };
            }
            groupedHistory[date][userIdString].historyItems.push({
                action: item.action,
                oldValue: item.oldValue,
                newValue: item.newValue,
                timestamp: item.timestamp,
            });
        });

        // Get user information and form the final data
        const result = [];
        for (const date in groupedHistory) {
            const usersData = groupedHistory[date];
            const usersInfo = [];
            for (const userId in usersData) {
                const userData = usersData[userId];
                const user = await getUserByMongoId(userId); // Update getUserByMongoId to accept string parameter
                if (user) {
                    userData.user.fullName = user.fullName ?? '';
                    usersInfo.push(userData);
                }
            }
            result.push({
                date,
                usersInfo,
            });
        }
        const totalPages = Math.ceil(result.length / pageSize);
        return { list: result, totalPages };
    } catch (error: any) {
        LOGGER.error('[getAllHistory][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return { list: [], totalPages: 0 };
    }
};

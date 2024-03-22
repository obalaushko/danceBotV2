import { LOGGER } from '../../logger/index.js';
import { HistoryModel, IHistory } from '../schemas/history.js';
import { getUserById } from './users.js';


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
 * @returns A promise that resolves to an array of history records.
 */
export const getAllHistory = async (): Promise<IHistory[]> => {
    try {
        const history = await HistoryModel.find().sort({ timestamp: -1 });
        return history;
    } catch (error: any) {
        LOGGER.error('[getAllHistory][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return [];
    }
};

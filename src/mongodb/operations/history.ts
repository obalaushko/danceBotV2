import moment from 'moment-timezone';
import { LOGGER } from '../../logger/index.js';
import { DailyHistoryModel, IDailyHistory } from '../schemas/dailyHistory.js';
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
}): Promise<IDailyHistory | null> => {
    try {
        const { userId, action, oldValue, newValue } = historyData;
        const user = await getUserById(userId);
        if (!user) return null;

        const today = moment.utc().startOf('day').toDate();

        let dailyHistory = await DailyHistoryModel.findOne({ date: today });

        if (!dailyHistory) {
            dailyHistory = new DailyHistoryModel({
                date: today,
                users: [
                    {
                        userId: user._id,
                        fullName: user.fullName,
                        actions: [
                            {
                                action,
                                oldValue,
                                newValue,
                                timestamp: moment.utc().toDate(),
                            },
                        ],
                    },
                ],
            });
        } else {
            const userHistory = dailyHistory.users.find(
                (u) => u.userId.toString() === user._id.toString()
            );

            if (userHistory) {
                userHistory.actions.push({
                    action,
                    oldValue,
                    newValue,
                    timestamp: moment.utc().toDate(),
                });
            } else {
                dailyHistory.users.push({
                    userId: user._id,
                    fullName: user.fullName,
                    actions: [
                        {
                            action,
                            oldValue,
                            newValue,
                            timestamp: moment.utc().toDate(),
                        },
                    ],
                });
            }
        }

        await dailyHistory.save();

        return dailyHistory;
    } catch (error: any) {
        LOGGER.error('[recordHistory][error]', { error });
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

        const history = await DailyHistoryModel.find({
            'users.userId': user._id,
        })
            .sort({ date: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        const result = history.map((dayHistory) => {
            const userActions = dayHistory.users.find(
                (u) => u.userId.toString() === user._id.toString()
            );
            return {
                date: moment(dayHistory.date).format('DD.MM.YYYY'),
                user: {
                    userId: user._id,
                    fullName: user.fullName,
                },
                historyItems: userActions ? userActions.actions : [],
            };
        });

        const totalPages = Math.ceil(
            (await DailyHistoryModel.countDocuments({
                'users.userId': user._id,
            })) / pageSize
        );
        return { list: result, totalPages };
    } catch (error: any) {
        LOGGER.error('[getUserHistory][error]', { error });
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
    pageSize: number = 10
): Promise<{ list: any[]; totalPages: number }> => {
    try {
        const historyDays = await DailyHistoryModel.find()
            .sort({ date: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        const result = await Promise.all(
            historyDays.map(async (dayHistory) => {
                const usersInfo = await Promise.all(
                    dayHistory.users.map(async (userHistory) => {
                        const user = await getUserByMongoId(userHistory.userId);
                        return {
                            user: {
                                userId: userHistory.userId,
                                fullName:
                                    user?.fullName ?? userHistory.fullName,
                            },
                            historyItems: userHistory.actions.sort(
                                (a, b) =>
                                    b.timestamp.getTime() -
                                    a.timestamp.getTime()
                            ),
                        };
                    })
                );

                return {
                    date: moment(dayHistory.date).format('DD.MM.YYYY'),
                    usersInfo,
                };
            })
        );

        const totalPages = Math.ceil(
            (await DailyHistoryModel.countDocuments()) / pageSize
        );

        return { list: result, totalPages };
    } catch (error: any) {
        LOGGER.error('[getAllHistory][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return { list: [], totalPages: 0 };
    }
};

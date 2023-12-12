import { Types } from 'mongoose';
import { LOGGER } from '../../logger/index.js';
import {
    GroupedChanges,
    IChangeLog,
    SubscriptionChangeLogModel,
} from '../schemas/changeLog.js';
import { getUserById } from './users.js';
import moment from 'moment-timezone';

export const addLogSubscriptionChange = async (
    userId: number,
    subscriptionId: Types.ObjectId,
    changeType: string
): Promise<void> => {
    try {
        const changeLogEntry = new SubscriptionChangeLogModel({
            userId: userId,
            subscriptionId: subscriptionId,
            changeType: changeType,
            changeDate: moment().utc().format(),
        });

        await changeLogEntry.save();
    } catch (error: any) {
        LOGGER.error('[addLogSubscriptionChange][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
    }
};

// ! Deprecated
export const getGroupedSubscriptionChangeLogs = async (): Promise<
    IChangeLog[] | null
> => {
    try {
        const groupedLogs = await SubscriptionChangeLogModel.aggregate([
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$changeDate',
                            },
                        },
                    },
                    changes: {
                        $push: { userId: '$userId', changeType: '$changeType' },
                    },
                },
            },
            { $sort: { '_id.date': -1 } },
        ]);

        return groupedLogs;
    } catch (error: any) {
        LOGGER.error('[getGroupedSubscriptionChangeLogs][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

export const getGroupedSubscriptionChanges =
    async (): Promise<GroupedChanges | null> => {
        try {
            const changeLogs: IChangeLog[] =
                await SubscriptionChangeLogModel.find({}).sort({
                    changeDate: -1,
                });

            const groupedChanges: GroupedChanges = {};

            for (const log of changeLogs) {
                const dateKey = log.changeDate.toISOString().split('T')[0];
                const userId = log.userId;
                const changeType = log.changeType;

                if (!groupedChanges[dateKey]) {
                    groupedChanges[dateKey] = [];
                }

                const user = await getUserById(userId);

                if (user) {
                    const existingUserEntry = groupedChanges[dateKey].find(
                        (entry) => entry.fullName === user.fullName
                    );

                    if (existingUserEntry) {
                        existingUserEntry.changes.push(changeType);
                    } else {
                        groupedChanges[dateKey].push({
                            fullName: user.fullName!,
                            changes: [changeType],
                        });
                    }
                }
            }

            return groupedChanges;
        } catch (error: any) {
            LOGGER.error('[getGroupedSubscriptionChanges][error]', {
                metadata: { error: error, stack: error.stack.toString() },
            });
            return null;
        }
    };

export const deleteOldLogs = async (): Promise<void> => {
    try {
        const twoMonthsAgo = moment().subtract(2, 'months').utc().format();

        await SubscriptionChangeLogModel.deleteMany({
            changeDate: { $lt: twoMonthsAgo },
        });
        LOGGER.info('[deleteOldLogs], Remove old logs');
    } catch (error: any) {
        LOGGER.error('[deleteOldLogs][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
    }
};

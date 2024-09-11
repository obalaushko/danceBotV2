import moment from 'moment-timezone';
import { LOGGER } from '../../logger/index.js';
import { ISubscription, SubscriptionModel } from '../schemas/subscription.js';
import { checkLastFreeze } from '../../utils/utils.js';
import { recordHistory } from './history.js';
import { actionsHistory } from '../../constants/global.js';

/**
 * Adds a subscription to the database.
 *
 * @param {Object} subscriptionData - The subscription data.
 * @param {string} subscriptionData.userId - The ID of the user.
 * @param {number} subscriptionData.totalLessons - The total number of lessons in the subscription.
 * @param {number} subscriptionData.usedLessons - The number of lessons already used.
 * @param {boolean} subscriptionData.active - Indicates if the subscription is active.
 * @returns {Promise<ISubscription | null>} A promise that resolves to the saved subscription or null if it already exists or an error occurred.
 */
export const addSubscription = async ({
    userId,
    totalLessons,
    usedLessons,
    active,
}: Pick<
    ISubscription,
    'userId' | 'totalLessons' | 'usedLessons' | 'active'
>): Promise<ISubscription | null> => {
    try {
        const subscription = await getSubscriptionById(userId);
        if (subscription) {
            return null;
        }

        const newSubscription = new SubscriptionModel({
            userId,
            totalLessons,
            usedLessons,
            active,
        });

        const savedSubscription = await newSubscription.save();

        if (savedSubscription?.userId) {
            LOGGER.info('[addSubscription][success]', {
                metadata: { savedSubscription },
            });
        } else {
            LOGGER.error('[addSubscription][error]', {
                metadata: { error: 'Subscription not saved' },
            });
        }

        return savedSubscription;
    } catch (error: any) {
        LOGGER.error('[addSubscription][error]', {
            metadata: { error: error, stack: error.stack?.toString() },
        });
        return null;
    }
};

/**
 * Retrieves a subscription by its user ID.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to the subscription object if found, or null if not found.
 */
export const getSubscriptionById = async (
    userId: number
): Promise<ISubscription | null> => {
    try {
        const subscription = await SubscriptionModel.findOne({ userId });
        return subscription;
    } catch (error: any) {
        LOGGER.error('[getSubscriptionById][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

/**
 * Updates a subscription by its ID.
 *
 * @param userId - The ID of the user.
 * @param update - The partial subscription object containing the fields to update.
 * @returns A promise that resolves to the updated subscription, or null if the subscription does not exist or an error occurs.
 */
export const updateSubscriptionById = async (
    userId: number,
    update: Partial<ISubscription>
): Promise<ISubscription | null> => {
    try {
        const subscription = await getSubscriptionById(userId);
        if (subscription) {
            Object.assign(subscription, update);
            await subscription.save();
            return subscription;
        }
        return null;
    } catch (error: any) {
        LOGGER.error('[updateSubscriptionById][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

/**
 * Activates subscriptions for the specified user(s).
 *
 * @param userId - The ID of the user or an array of user IDs.
 * @returns A promise that resolves to an array of updated subscriptions, or null if no subscriptions were found.
 */
export const activateSubscriptions = async (
    userId: number | number[]
): Promise<ISubscription[] | null> => {
    const userIds = Array.isArray(userId) ? userId : [userId];

    try {
        const subscriptions: ISubscription[] = await SubscriptionModel.find({
            userId: { $in: userIds },
        });

        if (subscriptions.length === 0) {
            return null;
        }

        const updatedSubscriptions: ISubscription[] = [];

        for (const subscription of subscriptions) {
            subscription.active = true;
            if (!subscription.firstActivation)
                subscription.firstActivation = true;

            await subscription.save();
            updatedSubscriptions.push(subscription);
            await recordHistory({
                userId: subscription.userId,
                action: actionsHistory.activateSubscription,
            });
        }

        return updatedSubscriptions;
    } catch (error: any) {
        LOGGER.error('[activateSubscriptions][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

/**
 * Deactivates subscriptions for the specified user(s).
 * @param userId - The ID(s) of the user(s) whose subscriptions should be deactivated.
 * @returns A promise that resolves to an array of updated subscriptions, or null if no subscriptions were found.
 */
export const deactivateSubscriptions = async (
    userId: number | number[]
): Promise<ISubscription[] | null> => {
    const userIds = Array.isArray(userId) ? userId : [userId];

    try {
        const subscriptions: ISubscription[] = await SubscriptionModel.find({
            userId: { $in: userIds },
        });

        if (subscriptions.length === 0) {
            return null;
        }

        const updatedSubscriptions: ISubscription[] = [];

        for (const subscription of subscriptions) {
            subscription.active = false;
            await subscription.save();
            updatedSubscriptions.push(subscription);
        }
        return updatedSubscriptions;
    } catch (error: any) {
        LOGGER.error('[deactivateSubscriptions][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

/**
 * Marks a lesson as used for the specified user(s).
 * @param userId - The ID of the user or an array of user IDs.
 * @returns A promise that resolves to an array of updated subscriptions, or null if no subscriptions were found.
 */
export const markLessonAsUsed = async (
    userId: number | number[]
): Promise<ISubscription[] | null> => {
    const userIds = Array.isArray(userId) ? userId : [userId];
    try {
        const subscriptions: ISubscription[] = await SubscriptionModel.find({
            userId: { $in: userIds },
        });

        if (subscriptions.length === 0) {
            return null;
        }

        const updatedSubscriptions: ISubscription[] = [];

        for (const subscription of subscriptions) {
            if (subscription.usedLessons! < subscription.totalLessons!) {
                subscription.usedLessons! += 1;
                await subscription.save();
                updatedSubscriptions.push(subscription);
                await recordHistory({
                    userId: subscription.userId,
                    action: actionsHistory.markUser,
                });
            }
        }

        return updatedSubscriptions;
    } catch (error: any) {
        LOGGER.error('[markLessonAsUsed][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

/**
 * Deletes a subscription from the database.
 * @param userId - The ID of the user or an array of user IDs.
 * @returns A promise that resolves to a boolean indicating whether the subscription was successfully deleted.
 */
export const deleteSubscription = async (
    userId: number | number[]
): Promise<boolean> => {
    try {
        const subscriptionIdArray = Array.isArray(userId) ? userId : [userId];

        const deleteResult = await SubscriptionModel.deleteMany({
            userId: { $in: subscriptionIdArray },
        });

        if (deleteResult.deletedCount > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error: any) {
        LOGGER.error('[deleteSubscription][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return false;
    }
};

// Freeze
interface IStatus {
    active: boolean;
    frozen: boolean;
}
/**
 * Retrieves the subscription statuses for a given user.
 * @param userId - The ID of the user.
 * @returns A Promise that resolves to an object containing the active and frozen status of the subscription, or null if no subscription is found.
 */
export const getSubscriptionStatuses = async (
    userId: number
): Promise<IStatus | null> => {
    try {
        const subscription = await getSubscriptionById(userId);
        if (subscription) {
            const active = subscription.active || false;
            const frozen = subscription.freeze?.active || false;
            return { active, frozen };
        }
        return null;
    } catch (error: any) {
        LOGGER.error('[getSubscriptionStatuses][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

/**
 * Freezes a subscription by user ID.
 *
 * @param userId - The ID of the user.
 * @returns A Promise that resolves to the frozen subscription if successful, or null if the subscription does not exist or freezing is not allowed.
 */
export const freezeSubscriptionByUserId = async (
    userId: number
): Promise<ISubscription | null> => {
    try {
        const subscription = await getSubscriptionById(userId);

        if (subscription) {
            const freezeIsAllowed = checkLastFreeze(
                subscription.freeze?.lastDateFreeze
            );
            if (!freezeIsAllowed) return null;
            const today = moment().utc();

            const freeze = {
                active: true,
                lastDateFreeze: today,
                frozenUntil: moment.utc(today).add(10, 'days').toDate(),
                dateExpired: moment
                    .utc(subscription.dateExpired)
                    .add(10, 'days')
                    .toDate(),
                usedLessons: subscription.usedLessons,
            };

            Object.assign(subscription, { freeze }, { active: false });
            await subscription.save();

            LOGGER.info('[freezeSubscriptionByUserId][success]', {
                metadata: subscription,
            });
            await recordHistory({
                userId: subscription.userId,
                action: actionsHistory.freezeSubscription,
            });
            return subscription;
        }
        return null;
    } catch (error: any) {
        LOGGER.error('[freezeSubscriptionByUserId][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

/**
 * Defrosts a subscription by user ID.
 *
 * @param userId - The ID of the user.
 * @returns A promise that resolves to the defrosted subscription, or null if the subscription does not exist.
 */
export const defrostSubscriptionByUserId = async (
    userId: number
): Promise<ISubscription | null> => {
    try {
        const subscription = await getSubscriptionById(userId);

        if (subscription) {
            // First active and save
            Object.assign(subscription, { active: true });
            await subscription.save();

            const today = moment().utc().startOf('day');

            const freeze = {
                lastDateFreeze: subscription.freeze?.lastDateFreeze,
                active: false,
                frozenUntil: undefined,
                dateExpired: undefined,
                usedLessons: undefined,
            };
            const diff = moment
                .utc(subscription.freeze?.frozenUntil)
                .startOf('day')
                .diff(today, 'days');

            const dateExpired = moment
                .utc(subscription.freeze?.dateExpired)
                .subtract(diff, 'days')
                .toDate();

            Object.assign(
                subscription,
                { freeze },
                {
                    usedLessons: subscription.freeze?.usedLessons,
                    dateExpired,
                }
            );
            await subscription.save();

            LOGGER.info('[defrostSubscriptionByUserId][success]', {
                metadata: subscription,
            });
            await recordHistory({
                userId: subscription.userId,
                action: actionsHistory.defrostSubscription,
            });
            return subscription;
        }
        return null;
    } catch (error: any) {
        LOGGER.error('[defrostSubscriptionByUserId][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

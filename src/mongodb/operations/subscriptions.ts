import moment from 'moment-timezone';
import { LOGGER } from '../../logger/index.js';
import { ISubscription, SubscriptionModel } from '../schemas/subscription.js';
import { checkLastFreeze } from '../../utils/utils.js';

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
        }

        return updatedSubscriptions;
    } catch (error: any) {
        LOGGER.error('[activateSubscriptions][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

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

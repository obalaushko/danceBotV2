import { LOGGER } from '../../logger/index.js';
import { ISubscription, SubscriptionModel } from '../schemas/subscription.js';

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
    id: number
): Promise<ISubscription | null> => {
    try {
        const subscription = await SubscriptionModel.findOne({ userId: id });
        return subscription;
    } catch (error: any) {
        LOGGER.error('[getSubscriptionById][error]', {
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

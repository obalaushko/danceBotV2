import { MSG } from '../constants/index.js';
import { LOGGER } from '../logger/index.js';
import { deleteOldLogs } from '../mongodb/operations/changeLog.js';
import {
    ISubscription,
    SubscriptionModel,
} from '../mongodb/schemas/subscription.js';
import { IUser, UserModel } from '../mongodb/schemas/user.js';
import { sendUserNotification } from './notifications.js';
import cron from 'node-cron';

export const dailyCheck = () => {
    // Function for checking and deactivating subscriptions
    const checkAndDeactivateSubscriptions = async () => {
        const users: IUser[] = await UserModel.find(); // Get all users
        for (const user of users) {
            if (user.subscription) {
                const subscription: ISubscription | null =
                    await SubscriptionModel.findById(user.subscription);
                if (subscription && subscription.dataExpired) {
                    const currentDate: Date = new Date();
                    const currentUtcDate: Date = new Date(
                        currentDate.toISOString()
                    );
                    if (currentUtcDate > subscription.dataExpired) {
                        subscription.active = false; // Deactivate the subscription if the expiration date has passed
                        await subscription.save(); // Save the updated subscription
                        if (user.notifications) {
                            await sendUserNotification(
                                user.userId,
                                MSG.user.notification.expired
                            );
                        }
                        LOGGER.info(
                            `[checkAndDeactivateSubscriptions] Subscription expired for ${user.userId}, ${user.fullName}`
                        );
                    }
                }
            }
        }
    };

    cron.schedule('0 12 * * *', function () {
        checkAndDeactivateSubscriptions();
    });

    cron.schedule('0 0 * * *', function () {
        deleteOldLogs();
    });
};

import { MSG } from '../constants';
import { LOGGER } from '../logger';
import {
    ISubscription,
    SubscriptionModel,
} from '../mongodb/schemas/subscription';
import { IUser, UserModel } from '../mongodb/schemas/user';
import { sendUserNotification } from './notifications';

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

    checkAndDeactivateSubscriptions();
    // Call the function to check and deactivate subscriptions, for example, every day
    setInterval(checkAndDeactivateSubscriptions, 24 * 60 * 60 * 1000); // 24 hours
};

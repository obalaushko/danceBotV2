import moment from 'moment-timezone';
import { MSG } from '../constants/index.js';
import { LOGGER } from '../logger/index.js';
import {
    ISubscription,
    SubscriptionModel,
} from '../mongodb/schemas/subscription.js';
import { IUser, UserModel } from '../mongodb/schemas/user.js';
import { sendUserNotification } from './notifications.js';
import { defrostSubscriptionByUserId } from '../mongodb/operations/subscriptions.js';
import { getUserById } from '../mongodb/operations/users.js';

import { removeUserFromGroup } from './users.js';

// Function for checking and deactivating subscriptions
export const checkAndDeactivateSubscriptions = async () => {
    const users: IUser[] = await UserModel.find(); // Get all users
    for (const user of users) {
        if (user.subscription) {
            const subscription: ISubscription | null =
                await SubscriptionModel.findById(user.subscription);
            if (subscription && subscription.dateExpired) {
                const currentUtcDate = moment.utc().toDate();

                if (currentUtcDate > subscription.dateExpired) {
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

export const checkAndDefrostSubscriptions = async () => {
    const subscriptions: ISubscription[] = await SubscriptionModel.find();

    for (const sub of subscriptions) {
        if (sub.freeze && sub.freeze.frozenUntil) {
            const currentUtcDate = moment.utc().toDate();

            if (currentUtcDate > sub.freeze.frozenUntil) {
                const defrost = await defrostSubscriptionByUserId(sub.userId);
                if (defrost) {
                    const user = await getUserById(sub.userId);
                    if (user && user.notifications) {
                        await sendUserNotification(
                            user.userId,
                            MSG.user.notification.defrostSubscriptions
                        );
                    }
                }
            }
        }
    }
};

export const checkLastDayOfUsage = async () => {
    const subscriptions: ISubscription[] | null =
        await SubscriptionModel.find();

    for (const subscription of subscriptions) {
        if (subscription && subscription.lastDateUsed) {
            const currentUtcDate = moment.utc();
            const lastDay = moment(subscription.lastDateUsed);

            const diffDays = currentUtcDate.diff(lastDay, 'days');

            if (diffDays >= 90) {
                // Deactivate user [left_chat_member] and remove from group
                await removeUserFromGroup([subscription.userId]);

                // Reset lastDateUsed
                subscription.lastDateUsed = undefined;
                await subscription.save();
            } else if (diffDays === 80) {
                // Send notification if it hasn't been sent yet
                await sendUserNotification(
                    subscription.userId,
                    MSG.user.notification.lastDayOfUsage
                );
            }
        }
    }
};

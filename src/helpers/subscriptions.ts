import { LOGGER } from '../logger';
import SubscriptionModel, {
    ISubscription,
} from '../mongodb/schemas/subscription';
import { IUser, UserModel } from '../mongodb/schemas/user';

export const dailyCheck = () => {
    // Функція для перевірки та деактивації підписки
    const checkAndDeactivateSubscriptions = async () => {
        const users: IUser[] = await UserModel.find(); // Отримуємо всіх користувачів
        for (const user of users) {
            if (user.subscription) {
                const subscription: ISubscription | null =
                    await SubscriptionModel.findById(user.subscription);
                if (subscription && subscription.dataExpired) {
                    const currentDate: Date = new Date();
                    if (currentDate > subscription.dataExpired) {
                        subscription.active = false; // Деактивуємо підписку, якщо дата закінчення вже минула
                        await subscription.save(); // Зберігаємо оновлену підписку
                        LOGGER.info(
                            `[checkAndDeactivateSubscriptions] Subscription expired for ${user.userId}, ${user.fullName}`
                        );
                    }
                }
            }
        }
    };

    // Викликаємо функцію перевірки та деактивації підписок, наприклад, кожну добу
    setInterval(checkAndDeactivateSubscriptions, 24 * 60 * 60 * 1000); // 24 години
};

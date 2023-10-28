import { Types } from 'mongoose';
import { LOGGER } from '../../logger';
import { SubscriptionChangeLogModel } from '../schemas/changeLog';

export const logSubscriptionChange = async (
    userId: number,
    subscriptionId: Types.ObjectId,
    changeType: string
): Promise<void> => {
    try {
        const changeLogEntry = new SubscriptionChangeLogModel({
            userId: userId, // Ідентифікатор користувача, який зробив зміну
            subscriptionId: subscriptionId, // Ідентифікатор оновленої підписки
            changeType: changeType, // Тип зміни
            changeDate: new Date(), // Поточна дата і час зміни
        });

        await changeLogEntry.save(); // Збережіть запис в історії
    } catch (error: any) {
        LOGGER.error('[logSubscriptionChange][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
    }
};

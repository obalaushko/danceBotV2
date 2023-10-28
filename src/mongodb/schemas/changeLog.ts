import { Schema, model, Types, Document, Model } from 'mongoose';

export interface IChangeLog extends Document {
    userId: number;
    subscriptionId: Types.ObjectId;
    changeType: string;
    changeDate: Date;
}

const subscriptionChangeLogSchema = new Schema({
    userId: {
        type: Number,
        required: true,
    },
    subscriptionId: {
        type: Types.ObjectId,
        required: true,
    },
    changeType: {
        type: String, // Рядок, що описує тип зміни (наприклад, 'активація', 'деактивація', 'оновлення')
        required: true,
    },
    changeDate: {
        type: Date, // Дата, коли сталася зміна
        required: true,
    },
    // Інші поля для запису деталей зміни, якщо потрібно
});

export const SubscriptionChangeLogModel: Model<IChangeLog> = model<IChangeLog>(
    'SubscriptionChangeLog',
    subscriptionChangeLogSchema
);


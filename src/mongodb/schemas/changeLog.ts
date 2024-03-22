import { Schema, model, Types, Document, Model } from 'mongoose';

export interface IChangeLog extends Document {
    userId: number;
    subscriptionId: Types.ObjectId;
    changeType: string;
    changeDate: Date;
    oldValue: any;
    newValue: any;
}

export interface GroupedChanges {
    [date: string]: { fullName: string; changes: string[] }[];
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
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed,
});

export const SubscriptionChangeLogModel: Model<IChangeLog> = model<IChangeLog>(
    'SubscriptionChangeLog',
    subscriptionChangeLogSchema
);

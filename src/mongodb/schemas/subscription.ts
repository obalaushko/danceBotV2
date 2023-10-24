import { Document, Schema, Model, model } from 'mongoose';

export interface ISubscription extends Document {
    userId: number;
    totalLessons: number;
    usedLessons: number;
}

const subscriptionSchema: Schema = new Schema<ISubscription>({
    userId: {
        type: Number,
        required: true,
    },
    totalLessons: {
        type: Number,
        required: true,
    },
    usedLessons: {
        type: Number,
        default: 0,
    },
});

const SubscriptionModel: Model<ISubscription> = model<ISubscription>(
    'Subscription',
    subscriptionSchema
);

export default SubscriptionModel;

import { Document, Schema, Model, model } from 'mongoose';

export interface ISubscription extends Document {
    userId: number;
    totalLessons?: number;
    usedLessons?: number;
    remainedLessons?: number;
    active?: boolean;
    dataExpired?: Date;
}

const subscriptionSchema: Schema = new Schema<ISubscription>({
    userId: {
        type: Number,
        required: true,
    },
    totalLessons: {
        type: Number,
        default: 8,
        required: true,
    },
    usedLessons: {
        type: Number,
        default: 0,
    },
    remainedLessons: { // dynamic
        type: Number,
    },
    active: {
        type: Boolean,
        default: false,
    },
    dataExpired: {
        type: Date,
    },
});

subscriptionSchema.methods.setExpirationDate = function () {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setMonth(today.getMonth() + 3);
    this.dataExpired = expirationDate;
};

subscriptionSchema.pre('save', function (next) {
    if (this.isModified('active')) {
        if (this.active) {
            this.setExpirationDate();
        } else if (!this.active) {
            this.dataExpired = undefined;
            this.usedLessons = 0;
        }
    }

    this.remainedLessons = this.totalLessons - this.usedLessons;

    if (this.usedLessons >= this.totalLessons) {
        this.active = false;
    }

    next();
});

const SubscriptionModel: Model<ISubscription> = model<ISubscription>(
    'Subscription',
    subscriptionSchema
);

export default SubscriptionModel;

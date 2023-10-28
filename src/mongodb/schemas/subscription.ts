import { Document, Schema, Model, model, Types } from 'mongoose';
import { logSubscriptionChange } from '../operations';

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
    remainedLessons: {
        // dynamic
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
    const expirationDate = new Date(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate(),
        today.getUTCHours(),
        today.getUTCMinutes(),
        today.getUTCSeconds()
    );
    expirationDate.setUTCMonth(expirationDate.getUTCMonth() + 3);
    this.dataExpired = expirationDate;
};

subscriptionSchema.methods.setChangeLog = async (
    userId: number,
    subscriptionId: Types.ObjectId,
    changeType: string
) => {
    await logSubscriptionChange(userId, subscriptionId, changeType);
};

subscriptionSchema.pre('save', function (next) {
    if (this.usedLessons >= this.totalLessons) {
        this.active = false;
    }
    let changeType: string = 'create';
    const subscriptionId: string = this._id ? this._id.toString() : '';

    if (this.isModified('active')) {
        if (this.active) {
            this.setExpirationDate();
            this.usedLessons = 0;
        } else if (!this.active) {
            this.dataExpired = undefined;
            this.usedLessons = 0;
        }

        changeType = this.active ? 'activation' : 'deactivation';
    } else if (this.isModified('usedLessons')) {
        changeType = 'markUser';
    }

    this.setChangeLog(this.userId, subscriptionId, changeType);

    this.remainedLessons = this.totalLessons - this.usedLessons;

    next();
});

export const SubscriptionModel: Model<ISubscription> = model<ISubscription>(
    'Subscription',
    subscriptionSchema
);

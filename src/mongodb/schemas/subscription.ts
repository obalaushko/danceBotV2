import { Document, Schema, Model, model, Types } from 'mongoose';
import { addLogSubscriptionChange } from '../operations/changeLog.js';
import { sendUserNotification } from '../../helpers/notifications.js';
import { MSG } from '../../constants/messages.js';
import moment from 'moment-timezone';

export interface ISubscription extends Document {
    userId: number;
    totalLessons?: number;
    usedLessons?: number;
    remainedLessons?: number;
    active?: boolean;
    firstActivation?: boolean;
    dateExpired?: Date;
    lastDateUsed?: Date;
    freeze?: {
        lastDateFreeze?: Date;
        dateExpired?: Date;
        frozenUntil?: Date;
        active: boolean;
        usedLessons?: number;
    };
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
    firstActivation: {
        type: Boolean,
        default: false,
    },
    dateExpired: {
        type: Date,
    },
    lastDateUsed: {
        type: Date,
    },
    freeze: {
        lastDateFreeze: {
            type: Date,
        },
        dateExpired: {
            type: Date,
        },
        frozenUntil: {
            type: Date,
        },
        active: {
            type: Boolean,
            default: false,
        },
        usedLessons: {
            type: Number,
        },
    },
});

subscriptionSchema.methods.setExpirationDate = function () {
    const today = moment().utc();
    const expirationDate = today.add(40, 'days');
    this.dateExpired = expirationDate.toDate();
};

subscriptionSchema.methods.setChangeLog = async (
    userId: number,
    subscriptionId: Types.ObjectId,
    changeType: string
) => {
    await addLogSubscriptionChange(userId, subscriptionId, changeType);
};

subscriptionSchema.pre('save', function (next) {
    if (this.usedLessons >= this.totalLessons) {
        this.active = false;

        sendUserNotification(
            this.userId,
            MSG.user.notification.remained0Lessons
        );
    }

    let changeType: string = 'create';
    const subscriptionId: string = this._id ? this._id.toString() : '';

    if (this.isModified('active')) {
        if (this.active) {
            this.setExpirationDate();
            this.usedLessons = 0;
        } else if (!this.active) {
            this.dateExpired = undefined;
            this.usedLessons = 0;

            const today = moment().utc();
            this.lastDateUsed = today;
        }

        changeType = this.active ? 'activation' : 'deactivation';
    } else if (this.isModified('usedLessons')) {
        changeType = 'markUser';
    }

    this.setChangeLog(this.userId, subscriptionId, changeType);

    this.remainedLessons = this.totalLessons - this.usedLessons;

    if (this.remainedLessons === 2) {
        sendUserNotification(
            this.userId,
            MSG.user.notification.remained2Lessons
        );
    }

    next();
});

export const SubscriptionModel: Model<ISubscription> = model<ISubscription>(
    'Subscription',
    subscriptionSchema
);

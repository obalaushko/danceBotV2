import { Document, Schema, Model, model, SchemaTypes } from 'mongoose';
import { ROLES } from '../../constants';
import { ISubscription } from './subscription';
import { IBank } from './payment';

export interface IUser extends Document {
    userId: number;
    role?: (typeof ROLES)[keyof typeof ROLES];
    username?: string;
    firstName?: string;
    subscription?: ISubscription | null;
    fullName?: string;
    approved?: boolean;
    notifications?: boolean;
    paymentDetails?: IBank | null
}

export const userSchema: Schema = new Schema<IUser>({
    userId: {
        type: Number,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: false,
        unique: true,
    },
    role: {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.Guest,
    },
    firstName: {
        type: String,
        required: false,
    },
    subscription: {
        type: SchemaTypes.ObjectId,
        ref: 'Subscription',
    },
    fullName: {
        type: String,
        required: false,
    },
    approved: {
        type: Boolean,
        default: false,
    },
    notifications: {
        type: Boolean,
        default: false,
    },
    paymentDetails: {
        type: SchemaTypes.ObjectId,
        ref: 'PaymentDetails'
    }
});

export const UserModel: Model<IUser> = model<IUser>('User', userSchema);

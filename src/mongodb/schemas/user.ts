import { Document, Schema, Model, model, SchemaTypes } from 'mongoose';
import { ROLES } from '../../constants/global.js';
import { ISubscription } from './subscription.js';

export interface IUser extends Document {
    userId: number;
    role?: (typeof ROLES)[keyof typeof ROLES];
    username?: string;
    firstName?: string;
    subscription?: ISubscription | null;
    fullName?: string;
    approved?: boolean;
    notifications?: boolean;
    inviteLink?: string | null;
}

export const userSchema: Schema = new Schema<IUser>({
    userId: {
        type: Number,
        required: true,
        unique: true,
        index: true,
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
        required: true,
    },
    approved: {
        type: Boolean,
        default: false,
    },
    notifications: {
        type: Boolean,
        default: true,
    },
    inviteLink: {
        type: String,
        default: null,
    },
});

export const UserModel: Model<IUser> = model<IUser>('User', userSchema);

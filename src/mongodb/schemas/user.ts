import { Document, Schema, Model, model, SchemaTypes } from 'mongoose';
import { ROLES } from '../../constants';
import { ISubscription } from './subscription';

export interface IUser extends Document {
    userId: string;
    role: (typeof ROLES)[keyof typeof ROLES];
    username?: string;
    firstName?: string;
    subscription: ISubscription | null;
    fullName?: string;
    approved: boolean;
    notifications?: boolean;
}

const userSchema: Schema = new Schema<IUser>({
    userId: {
        type: String,
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
});

const UserModel: Model<IUser> = model<IUser>('User', userSchema);

export default UserModel;

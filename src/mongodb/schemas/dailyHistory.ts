import moment from 'moment-timezone';
import { Document, Schema, Model, model } from 'mongoose';
interface IAction {
    action: string;
    oldValue?: any;
    newValue?: any;
    timestamp: Date;
}

interface IUserHistory {
    userId: Schema.Types.ObjectId;
    fullName: string;
    actions: IAction[];
}

export interface IDailyHistory extends Document {
    date: Date;
    users: IUserHistory[];
}

const ActionSchema = new Schema<IAction>({
    action: { type: String, required: true },
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed,
    timestamp: { type: Date, default: () => moment.utc().toDate() },
});

const UserHistorySchema = new Schema<IUserHistory>({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    fullName: { type: String, required: true },
    actions: [ActionSchema],
});

const DailyHistorySchema: Schema = new Schema<IDailyHistory>({
    date: { type: Date, required: true, index: true },
    users: [UserHistorySchema],
});

export const DailyHistoryModel: Model<IDailyHistory> = model<IDailyHistory>(
    'DailyHistory',
    DailyHistorySchema
);

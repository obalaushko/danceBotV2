import moment from 'moment-timezone';
import { Document, Schema, Model, model } from 'mongoose';

/**
 * @deprecated
 */
export interface IHistory extends Document {
    userId: Schema.Types.ObjectId;
    action: string;
    oldValue?: any;
    newValue?: any;
    timestamp: Date;
}

const HistorySchema: Schema = new Schema<IHistory>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Add an index
    },
    action: {
        type: String,
        required: true,
    },
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed,
    timestamp: {
        type: Date,
        default: () => moment.utc().toDate(),
    },
});
/**
 * @deprecated
 */
export const HistoryModel: Model<IHistory> = model<IHistory>(
    'History',
    HistorySchema
);

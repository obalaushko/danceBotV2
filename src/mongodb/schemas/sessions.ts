import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISession extends Document {
    userId: string;
    data?: any;
}

const sessionSchema: Schema = new Schema({
    userId: { type: String, required: true },
    data: { type: Object, default: {} },
});

export const SessionModel: Model<ISession> = mongoose.model<ISession>(
    'Session',
    sessionSchema
);

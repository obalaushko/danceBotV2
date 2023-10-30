import { Document, Model, Schema, model } from 'mongoose';
import { BANKS } from '../../constants';

export interface IBank extends Document {
    userId: number;
    bank: (typeof BANKS)[keyof typeof BANKS];
    card: number;
}

export const bankSchema: Schema = new Schema<IBank>({
    userId: {
        type: Number,
        required: true,
    },
    bank: {
        type: String,
        enum: Object.values(BANKS),
        required: true,
    },
    card: {
        type: Number,
        required: true,
    },
});

export const PaymentDetailsModel: Model<IBank> = model<IBank>('PaymentDetails', bankSchema);

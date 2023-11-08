import { Document, Model, Schema, model } from 'mongoose';
import { BANKS } from '../../constants/global.js';

export interface IBank extends Document {
    userId: number;
    details: [
        banks: {
            name: (typeof BANKS)[keyof typeof BANKS];
            card: number;
        },
    ];
}

export const bankSchema: Schema = new Schema<IBank>({
    userId: {
        type: Number,
        required: true,
    },
    details: [
        {
            name: {
                type: String,
                enum: Object.values(BANKS),
                required: true,
            },
            card: {
                type: Number,
                required: true,
            },
        },
    ],
});

export const PaymentDetailsModel: Model<IBank> = model<IBank>(
    'PaymentDetails',
    bankSchema
);

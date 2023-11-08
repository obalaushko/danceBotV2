// export const checkPaymentDetails = async ({
//     userId,
//     bank,
//     card,
// }: Pick<IBank, 'userId' | 'bank' | 'card'>): Promise<IBank | null> => {
//     try {
//         const userWithPayment = await getUserWithPaymentDetails(userId);

import { LOGGER } from '../../logger/index.js';
import { IBank, PaymentDetailsModel } from '../schemas/payment.js';
import { getUserById, getUserWithPaymentDetails } from './users.js';

//         if (!userWithPayment?.paymentDetails) {
//             const user = await UserModel.findOne({ userId });

//             const newPaymentDetails = new PaymentDetailsModel({
//                 userId,
//                 bank,
//                 card,
//             });

//             const savedPaymentDetails = await newPaymentDetails.save();

//             if (user) {
//                 user.paymentDetails = savedPaymentDetails;
//                 await user.save();
//             }
//             return savedPaymentDetails;
//         } else if (userWithPayment?.paymentDetails) {
//             return userWithPayment?.paymentDetails;
//         } else {
//             return null;
//         }
//     } catch (error: any) {
//         LOGGER.error('[getUserWithPaymentDetails][error]', {
//             metadata: { error: error, stack: error.stack.toString() },
//         });
//         return null;
//     }
// };

export const getPaymentDetailsExist = async (
    userId: number
): Promise<IBank | null> => {
    try {
        const userWithPayment = await getUserWithPaymentDetails(userId);
        if (userWithPayment?.paymentDetails) {
            return userWithPayment?.paymentDetails;
        } else {
            return null;
        }
    } catch (error: any) {
        LOGGER.error('[getPaymentDetailsExist][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

export const createPaymentDetails = async ({
    userId,
    details,
}: Pick<IBank, 'userId' | 'details'>): Promise<IBank | null> => {
    try {
        const user = await getUserById(userId);

        if (user) {
            const newPaymentDetails = new PaymentDetailsModel({
                userId,
                details,
            });

            const savedPaymentDetails = await newPaymentDetails.save();

            user.paymentDetails = savedPaymentDetails;
            await user.save();

            return savedPaymentDetails;
        } else {
            LOGGER.error(
                `[createPaymentDetails][error] User with id-${userId} dosn't exist`
            );
            return null;
        }
    } catch (error: any) {
        LOGGER.error('[createPaymentDetails][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

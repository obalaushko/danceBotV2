import { LOGGER } from '../../logger';
import { IBank, PaymentDetailsModel } from '../schemas/payment';
import { UserModel } from '../schemas/user';
import { getUserWithPaymentDetails } from './users';

export const addPaymentDetails = async ({
    userId,
    bank,
    card,
}: Pick<IBank, 'userId' | 'bank' | 'card'>): Promise<IBank | null> => {
    try {
        const userWithPayment = await getUserWithPaymentDetails(userId);

        if (!userWithPayment) {
            const user = await UserModel.findOne({ userId });
    
            const newPaymentDetails = new PaymentDetailsModel({
                userId,
                bank,
                card,
            });
    
            const savedPaymentDetails = await newPaymentDetails.save();
    
            if (user) {
                user.paymentDetails = savedPaymentDetails;
                await user.save();
            }
    
            return savedPaymentDetails;
        } else {
            return null;
        }
    }  catch (error: any) {
        LOGGER.error('[getUserWithPaymentDetails][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
    
};

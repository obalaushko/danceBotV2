import { BANKS, ROLES } from '../../constants';
import { LOGGER } from '../../logger';
import { IBank, PaymentDetailsModel } from '../schemas/payment';
import { IUser, UserModel } from '../schemas/user';

export const addUser = async ({
    userId,
    username = '',
    role = ROLES.Guest,
    firstName = '',
    subscription = null,
    fullName = '',
    approved = false,
    notifications = false,
}: Pick<
    IUser,
    | 'userId'
    | 'username'
    | 'role'
    | 'firstName'
    | 'subscription'
    | 'fullName'
    | 'approved'
    | 'notifications'
>): Promise<IUser | null> => {
    try {
        const user = await getUserById(userId);
        if (user) {
            return null;
        }

        const newUser = new UserModel({
            userId,
            username,
            role,
            firstName,
            subscription,
            fullName,
            approved,
            notifications,
        });

        const savedUser = await newUser.save();

        if (savedUser?.id) {
            LOGGER.info('[addUser][success]', { metadata: { savedUser } });
        } else {
            LOGGER.error('[addUser][error]', {
                metadata: { error: 'User not saved' },
            });
        }

        return savedUser;
    } catch (error: any) {
        LOGGER.error('[addUser][error]', {
            metadata: { error: error, stack: error.stack?.toString() },
        });
        return null;
    }
};

export const getUserById = async (id: number): Promise<IUser | null> => {
    try {
        const user = await UserModel.findOne({ userId: id });
        return user;
    } catch (error: any) {
        LOGGER.error('[getUserById][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

export const updateUserById = async (
    userId: number,
    update: Partial<IUser>
): Promise<IUser | null> => {
    try {
        const user = await getUserById(userId);
        if (user) {
            Object.assign(user, update);
            await user.save();
            return user;
        }
        return null;
    } catch (error: any) {
        LOGGER.error('[updateUserById][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

export const getAllUsers = async (): Promise<IUser[] | null> => {
    try {
        const users = await UserModel.find()
            .populate({
                path: 'subscription',
                select: '-_id',
            })
            .exec();

        return users;
    } catch (error: any) {
        LOGGER.error('[getAllUsers][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

export const getAllGuestUsers = async (): Promise<IUser[] | null> => {
    try {
        const guestUsers = await UserModel.find({ role: ROLES.Guest }).exec();

        return guestUsers;
    } catch (error: any) {
        LOGGER.error('[getAllGuestUsers][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

export const getAllUserUsers = async (): Promise<IUser[] | null> => {
    try {
        const userUsers = await UserModel.find({ role: ROLES.User }).exec();

        return userUsers;
    } catch (error: any) {
        LOGGER.error('[getAllUserUsers][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

export const approveUsers = async (
    userIds: number[]
): Promise<IUser[] | null> => {
    try {
        const updatedUsers: IUser[] = [];

        for (const userId of userIds) {
            const user = await UserModel.findOne({ userId }).exec();

            if (user) {
                user.approved = true;
                user.role = ROLES.User;

                await user.save();

                updatedUsers.push(user);
            }
        }

        if (!updatedUsers.length) return null;

        return updatedUsers;
    } catch (error: any) {
        LOGGER.error('[approveUsers][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

export const getAllActiveUserUsers = async (): Promise<IUser[] | null> => {
    try {
        const activeUserUsers = await UserModel.find({ role: ROLES.User })
            .populate({
                path: 'subscription',
                match: { active: true },
                select: '-_id',
            })
            .exec();

        const usersWithActiveSubscriptions = activeUserUsers.filter((user) => {
            return user.subscription !== null;
        });

        return usersWithActiveSubscriptions;
    } catch (error: any) {
        LOGGER.error('[getAllActiveUserUsers][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

export const getAllDeactiveUserUsers = async (): Promise<IUser[] | null> => {
    try {
        const deactiveUserUsers = await UserModel.find({ role: ROLES.User })
            .populate({
                path: 'subscription',
                match: { active: false },
                select: '-_id',
            })
            .exec();

        const usersWithDeactiveSubscriptions = deactiveUserUsers.filter(
            (user) => {
                return user.subscription !== null;
            }
        );

        return usersWithDeactiveSubscriptions;
    } catch (error: any) {
        LOGGER.error('[getAllDeactiveUserUsers][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

export const getPaymentDetails = async (
    userId: number
): Promise<IUser[] | null> => {
    try {
        const paymentsDetails = await UserModel.find({ userId })
            .populate({
                path: 'paymentDetails',
                select: '-_id',
            })
            .exec();

        const usersWithPaymentDetails = paymentsDetails.filter((user) => {
            return user.paymentDetails !== null;
        });

        console.log(usersWithPaymentDetails);

        if (usersWithPaymentDetails.length > 0) {
            return usersWithPaymentDetails;
        } else {
            return null;
        }
    } catch (error: any) {
        LOGGER.error('[getPaymentDetails][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

export const addPaymentDetails = async ({
    userId,
    bank,
    card,
}: Pick<IBank, 'userId' | 'bank' | 'card'>): Promise<IBank | null> => {
    const newPaymentDetails = new PaymentDetailsModel({
        userId,
        bank,
        card,
    });
    const savedPaymentDetails = await newPaymentDetails.save();

    const user = await UserModel.findOne({ userId }).exec();

    if (user) {
        
        user.paymentDetails = savedPaymentDetails;
        await user.save();
        console.log(user)
    }

    console.log(savedPaymentDetails);
    return savedPaymentDetails;
};

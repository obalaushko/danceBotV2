import { ROLES } from '../../constants';
import { LOGGER } from '../../logger';
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
        const users = await UserModel.find().exec();

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

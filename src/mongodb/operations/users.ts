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
            LOGGER.info('[addUser][success]', { metadata: {} });
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

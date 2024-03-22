import { ObjectId } from 'mongoose';
import { ROLES, actionsHistory } from '../../constants/global.js';
import { MSG } from '../../constants/messages.js';
import { LOGGER } from '../../logger/index.js';
import { IUser, UserModel } from '../schemas/user.js';
import { recordHistory } from './history.js';

/**
 * Adds a new user to the database.
 *
 * @param {Object} user - The user object containing the user details.
 * @param {string} user.userId - The unique identifier of the user.
 * @param {string} user.username - The username of the user.
 * @param {string} user.role - The role of the user.
 * @param {string} user.firstName - The first name of the user.
 * @param {string} user.subscription - The subscription status of the user.
 * @param {string} user.fullName - The full name of the user.
 * @param {boolean} user.approved - The approval status of the user.
 * @param {boolean} user.notifications - The notification status of the user.
 * @returns {Promise<IUser | null>} The saved user object if successful, otherwise null.
 */
export const addUser = async ({
    userId,
    username,
    role,
    firstName,
    subscription,
    fullName,
    approved,
    notifications,
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
            await recordHistory({
                userId: savedUser.userId,
                action: actionsHistory.create,
            });
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

/**
 * Retrieves a user by their ID.
 * @param id - The ID of the user.
 * @returns A Promise that resolves to the user object if found, or null if not found.
 */
export const getUserById = async (userId: number): Promise<IUser | null> => {
    try {
        const user = await UserModel.findOne({ userId: userId }).exec();
        if (user) {
            return user;
        } else {
            return null;
        }
    } catch (error: any) {
        LOGGER.error('[getUserById][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

/**
 * Retrieves a user from the MongoDB database based on their ID.
 * @param id - The ID of the user to retrieve.
 * @returns A Promise that resolves to the retrieved user or null if not found.
 */
export const getUserByMongoId = async (id: ObjectId | string): Promise<IUser | null> => {
    try {
        const user = await UserModel.findOne({ _id: id }).exec();
        if (user) {
            return user;
        } else {
            return null;
        }
    } catch (error: any) {
        LOGGER.error('[getUserByMongoId][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

/**
 * Retrieves a user with their subscription by ID.
 * @param id - The ID of the user.
 * @returns A Promise that resolves to the user with their subscription, or null if not found.
 */
export const getUserWithSubscriptionById = async (
    id: number
): Promise<IUser | null> => {
    try {
        const user = await UserModel.findOne({ userId: id })
            .populate({
                path: 'subscription',
                select: '-_id',
            })
            .exec();
        if (user) {
            return user;
        } else {
            return null;
        }
    } catch (error: any) {
        LOGGER.error('[getUserWithSubscriptionById][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

/**
 * Retrieves users by their user IDs.
 * @param userIds - An array of user IDs.
 * @returns A promise that resolves to an array of users or null if an error occurs.
 */
export const getUsersByUserIds = async (
    userIds: number[]
): Promise<IUser[] | null> => {
    try {
        const users = await UserModel.find({ userId: { $in: userIds } });
        return users;
    } catch (error: any) {
        LOGGER.error('[getUsersByUserIds][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

/**
 * Updates a user by their ID.
 *
 * @param userId - The ID of the user to update.
 * @param update - The partial user object containing the fields to update.
 * @returns A Promise that resolves to the updated user object, or null if the user does not exist or an error occurs.
 */
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

/**
 * Retrieves all users from the database, excluding developers.
 * @returns A promise that resolves to an array of IUser objects or null if an error occurs.
 */
export const getAllUsers = async (): Promise<IUser[] | null> => {
    try {
        const users = await UserModel.find({
            role: { $nin: [ROLES.Developer] },
        })
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

export const getAllRealUser = async (): Promise<IUser[] | null> => {
    try {
        const users = await UserModel.find({
            role: { $nin: [ROLES.Developer, ROLES.Admin, ROLES.Guest] },
        })
            .populate({
                path: 'subscription',
                select: '-_id',
            })
            .exec();

        return users;
    } catch (error: any) {
        LOGGER.error('[getAllRealUser][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

/**
 * Retrieves all guest users from the database.
 * @returns A promise that resolves to an array of guest users or null if an error occurs.
 */
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

/**
 * Retrieves all user users from the database.
 * @returns A promise that resolves to an array of IUser objects or null if an error occurs.
 */
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

/**
 * Approves the users with the specified user IDs.
 *
 * @param userIds - An array of user IDs to approve.
 * @returns A promise that resolves to an array of approved users, or null if no users were approved.
 */
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
                await recordHistory({
                    userId: user.userId,
                    action: actionsHistory.approveUser,
                });
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

/**
 * Retrieves all active users with active subscriptions.
 * @returns A promise that resolves to an array of IUser objects or null if an error occurs.
 */
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

/**
 * Retrieves all users with deactive subscriptions.
 * @returns A Promise that resolves to an array of IUser objects or null if an error occurs.
 */
export const getAllDeactiveUserUsers = async (): Promise<IUser[] | null> => {
    try {
        const deactiveUserUsers = await UserModel.find({ role: ROLES.User })
            .populate({
                path: 'subscription',
                match: { active: false, 'freeze.active': false },
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

/**
 * Retrieves a user with their payment details from the database.
 * @param userId - The ID of the user.
 * @returns A Promise that resolves to the user with payment details, or null if not found.
 */
export const getUserWithPaymentDetails = async (
    userId: number
): Promise<IUser | null> => {
    try {
        const user = await UserModel.findOne({ userId })
            .populate({
                path: 'paymentDetails',
                select: '-_id',
            })
            .exec();

        if (user) {
            return user;
        } else {
            return null;
        }
    } catch (error: any) {
        LOGGER.error('[getUserWithPaymentDetails][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

/**
 * Retrieves all users that can be set as inactive.
 *
 * @returns A promise that resolves to an array of IUser objects or null if an error occurs.
 */
export const getAllCanBeSetIncactiveUsers = async (): Promise<
    IUser[] | null
> => {
    try {
        const users = await UserModel.find({
            role: { $nin: [ROLES.Admin, ROLES.Developer, ROLES.Inactive] },
        }).exec();

        return users;
    } catch (error: any) {
        LOGGER.error('[getAllCanBeSetIncactiveUsers][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

/**
 * Retrieves all users that can be deleted.
 *
 * @returns A promise that resolves to an array of IUser objects or null if an error occurs.
 */
export const getAllCanBeDeletedUsers = async (): Promise<IUser[] | null> => {
    try {
        const users = await UserModel.find({
            role: { $nin: [ROLES.Admin, ROLES.Developer] },
        }).exec();

        return users;
    } catch (error: any) {
        LOGGER.error('[getAllCanBeDeletedUsers][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

/**
 * Updates the users to inactive status.
 * @param userIds - The ID(s) of the user(s) to update.
 * @returns A promise that resolves to an array of updated users, or null if no users were updated.
 */
export const updateUsersToInactive = async (
    userIds: number | number[]
): Promise<IUser[] | null> => {
    try {
        const userIdArray = Array.isArray(userIds) ? userIds : [userIds];

        const updatedUsers = await UserModel.updateMany(
            { userId: { $in: userIdArray } },
            {
                approved: false,
                role: ROLES.Inactive,
                notifications: false,
            }
        );

        if (updatedUsers.modifiedCount > 0) {
            const users = await UserModel.find({
                userId: { $in: userIdArray },
            });
            for (const user of users) {
                await recordHistory({
                    userId: user.userId,
                    action: actionsHistory.moveToInactive,
                });
            }

            LOGGER.info('[updateUsersToInactive][success]', {
                metadata: { users },
            });
            return users;
        }

        return null;
    } catch (error: any) {
        LOGGER.error('[updateUsersToInactive][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

/**
 * Updates the role of an inactive user to "Guest" and enables notifications.
 *
 * @param userId - The ID of the user to update.
 * @returns A Promise that resolves to the updated user object if found, or null if not found or an error occurred.
 */
export const updateInactiveToGuest = async (
    userId: number
): Promise<IUser | null> => {
    try {
        const user = await UserModel.findOne({ userId }).exec();

        if (user) {
            user.role = ROLES.Guest;
            user.notifications = true;

            await user.save();

            await recordHistory({
                userId: user.userId,
                action: actionsHistory.moveToActive,
            });

            return user;
        }

        return null;
    } catch (error: any) {
        LOGGER.error('[updateInactiveToUser][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return null;
    }
};

/**
 * Deletes users from the database.
 *
 * @param userId - The ID or an array of IDs of the users to be deleted.
 * @param adminId - The ID of the admin performing the deletion.
 * @returns A promise that resolves to a boolean indicating whether the deletion was successful.
 */
export const deleteUsers = async (
    userId: number | number[],
    adminId: number
): Promise<boolean> => {
    try {
        const admin = await getUserById(adminId);
        if (admin?.role == ROLES.Admin || admin?.role == ROLES.Developer) {
            const userIdArray = Array.isArray(userId) ? userId : [userId];

            const deleteResult = await UserModel.deleteMany({
                userId: { $in: userIdArray },
            });

            if (deleteResult.deletedCount > 0) {
                return true;
            } else {
                return false;
            }
        } else {
            throw new Error(MSG.inappropriateRole);
        }
    } catch (error: any) {
        LOGGER.error('[deleteUser][error]', {
            metadata: { error: error, stack: error.stack.toString() },
        });
        return false;
    }
};

import { Request, Response } from 'express';
import { errorResponse, successResponse } from '../response.js';
import {
    getAllRealUser,
    getUserById,
    getUserWithSubscriptionById,
    updateUserById,
    updateUsersToInactive,
} from '../../mongodb/operations/users.js';
import { LOGGER } from '../../logger/index.js';
import { hasAdminOrDevRole } from '../../utils/utils.js';
import {
    RequestBodyUpdateUser,
    RequestBodyUserInfo,
    ResponseBody,
} from '../types/index.js';
import {
    activateSubscriptions,
    deactivateSubscriptions,
    updateSubscriptionById,
} from '../../mongodb/operations/subscriptions.js';
import { ROLES } from '../../constants/global.js';
import { removeUserFromGroup } from '../../helpers/users.js';

export default class UserController {
    /**
     * Retrieves all users except  admin | developer | guest.
     *
     * @param req - The request object.
     * @param res - The response object.
     * @returns A JSON response with the list of users or an error message.
     */
    async getAllUsers(
        req: Request<object, object, object>,
        res: Response<ResponseBody>
    ) {
        try {
            const users = await getAllRealUser();

            if (users) {
                return res.status(200).json(
                    successResponse({
                        data: users,
                    })
                );
            } else {
                return res.status(400).json(
                    errorResponse({
                        message: 'Users not found!',
                        error: null,
                    })
                );
            }
        } catch (error: any) {
            LOGGER.error('[users]', { metadata: error });
            return res
                .status(500)
                .json(errorResponse({ message: error, error }));
        }
    }

    /**
     * Retrieves a user by their ID.
     * * Check if user has access
     * @param req - The request object containing the user ID in the request body.
     * @param res - The response object used to send the result back to the client.
     * @returns A JSON response with the user data if found, or an error response if the user is not found.
     */
    async getUserById(
        req: Request<object, object, RequestBodyUserInfo>,
        res: Response<ResponseBody>
    ) {
        try {
            const { userId } = req.body;
            const accessDenied = await hasAdminOrDevRole(userId);
            if (!accessDenied) {
                return res.status(403).json(
                    errorResponse({
                        message: 'У доступі відмовлено!',
                        error: null,
                    })
                );
            }

            const user = await getUserById(userId);

            if (user) {
                return res.status(200).json(
                    successResponse({
                        data: user,
                    })
                );
            } else {
                return res.status(400).json(
                    errorResponse({
                        message: 'User not found!',
                        error: null,
                    })
                );
            }
        } catch (error: any) {
            LOGGER.error('[POST][user-info]', { metadata: error });
            return res
                .status(500)
                .json(errorResponse({ message: error, error }));
        }
    }

    /**
     * Retrieves a user with subscription by their ID.
     *
     * @param req - The request object containing the user ID in the query parameters.
     * @param res - The response object to send the result.
     * @returns A JSON response with the user data if found, or an error response if not found.
     */
    async getUserWithSubscriptionById(
        req: Request<object, object, object, { userId: string }>,
        res: Response<ResponseBody>
    ) {
        try {
            const { userId } = req.query;

            const user = await getUserWithSubscriptionById(Number(userId));

            if (user) {
                return res.status(200).json(
                    successResponse({
                        data: user,
                    })
                );
            } else {
                return res.status(400).json(
                    errorResponse({
                        message: 'User not found!',
                        error: null,
                    })
                );
            }
        } catch (error: any) {
            LOGGER.error('[GET][user-info]', { metadata: error });
            return res
                .status(500)
                .json(errorResponse({ message: error, error }));
        }
    }

    /**
     * Updates a user's data and subscription based on the provided request body.
     * @param req - The request object containing the request body.
     * @param res - The response object used to send the response.
     * @returns A JSON response with the updated user data or an error message.
     */
    async updateUser(
        req: Request<object, object, RequestBodyUpdateUser>,
        res: Response<ResponseBody>
    ) {
        try {
            const { userId } = req.body;

            // Update user data
            type ValidKeys = keyof RequestBodyUpdateUser;

            const validKeysUser: ValidKeys[] = [
                'firstName',
                'fullName',
                'notifications',
                'role',
            ];
            const validKeysSubscription: ValidKeys[] = [
                'totalLessons',
                'usedLessons',
                'dateExpired',
                'active',
            ];

            const filterKeys = (keys: ValidKeys[]) => {
                const updatedValues: any = {};
                keys.forEach((key) => {
                    if (req.body[key] !== undefined) {
                        updatedValues[key] = req.body[key];
                    }
                });
                return updatedValues;
            };

            const updatedUserValues = filterKeys(validKeysUser);
            const updatedSubscriptionsValues = filterKeys(
                validKeysSubscription
            );

            let userUpdated = false;
            let subscriptionUpdated = false;

            if (Object.keys(updatedUserValues).length > 0) {
                // Update user
                const roleUser = updatedUserValues.role;
                if (roleUser === ROLES.Inactive) {
                    await updateUsersToInactive(userId);
                    await removeUserFromGroup([userId]);
                }
                const updatedUser = await updateUserById(
                    userId,
                    updatedUserValues
                );
                userUpdated = updatedUser !== null; // or some other check
            }

            if (Object.keys(updatedSubscriptionsValues).length > 0) {
                // Update subscription
                const activeSubscriptions = updatedSubscriptionsValues.active;
                if (activeSubscriptions === true) {
                    await activateSubscriptions(userId);
                } else if (activeSubscriptions === false) {
                    await deactivateSubscriptions(userId);
                }

                const updatedSubscription = await updateSubscriptionById(
                    userId,
                    updatedSubscriptionsValues
                );
                subscriptionUpdated = updatedSubscription !== null; // or some other check
            }

            if (!userUpdated && !subscriptionUpdated) {
                return res.status(400).json(
                    errorResponse({
                        message: 'No data was updated!',
                        error: null,
                    })
                );
            }

            // Return user
            const user = await getUserWithSubscriptionById(userId);

            if (user) {
                return res.status(200).json(
                    successResponse({
                        data: user,
                    })
                );
            } else {
                return res.status(400).json(
                    errorResponse({
                        message: 'User not found!',
                        error: null,
                    })
                );
            }
        } catch (error: any) {
            LOGGER.error('[GET][user-info]', { metadata: error });
            return res
                .status(500)
                .json(errorResponse({ message: error, error }));
        }
    }
}

import { Request, Response } from 'express';
import {
    RequestBodyUserInfo,
    ResponseBody,
    errorResponse,
    successResponse,
} from '../response.js';
import {
    getAllUsers,
    getUserById,
    getUserWithSubscriptionById,
} from '../../mongodb/operations/users.js';
import { LOGGER } from '../../logger/index.js';
import { isAccessDenied } from '../../utils/utils.js';

export default class UserController {
    /**
     * Retrieves all users.
     *
     * @param req - The request object.
     * @param res - The response object.
     * @returns A JSON response with the list of users or an error message.
     */
    async getAllUsers(req: Request<{}, {}, {}>, res: Response<ResponseBody>) {
        try {
            const users = await getAllUsers();

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
        req: Request<{}, {}, RequestBodyUserInfo>,
        res: Response<ResponseBody>
    ) {
        try {
            const { userId } = req.body;
            const accessDenied = await isAccessDenied(res, userId);
            if (!accessDenied) return;

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
        req: Request<{}, {}, {}, { userId: string }>,
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
}

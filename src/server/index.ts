import { ENV_VARIABLES } from './../constants/global';
import {
    getAllActiveUserUsers,
    getAllUsers,
    getUserById,
    getUserWithSubscriptionById,
} from './../mongodb/operations/users.js';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { LOGGER } from '../logger/index.js';
import { markLessonAsUsed } from '../mongodb/operations/subscriptions.js';
import {
    RequestBodyScannerApi,
    RequestBodyUserInfo,
    ResponseBody,
    errorResponse,
    successResponse,
} from './response.js';
import { isAccessDenied } from '../utils/utils.js';

export const serverInit = async () => {
    const app = express();

    app.use(express.json());
    app.use(cors());

    app.get('/', (req, res) => res.json({ message: 'Server is running' }));

    app.post(
        '/web-data',
        async (
            req: Request<{}, {}, RequestBodyScannerApi>,
            res: Response<ResponseBody>
        ) => {
            try {
                const { userId, userIds } = req.body;
                const accessDenied = await isAccessDenied(res, userId);
                if (!accessDenied) return;

                if (userIds) {
                    const users = await getAllActiveUserUsers();

                    if (users) {
                        const matchingUsers = users.filter((user) =>
                            userIds.includes(user.userId)
                        );

                        if (matchingUsers.length > 0) {
                            const updateSubscriptions = await markLessonAsUsed(
                                matchingUsers.map((user) => user.userId)
                            );

                            if (updateSubscriptions?.length) {
                                LOGGER.info('[markUser]', {
                                    metadata: updateSubscriptions,
                                });

                                if (!users) throw new Error('Users not found!');

                                // const updatedUsers = users.filter((user) =>
                                //     updateSubscriptions.some(
                                //         (updateUser) => updateUser.userId === user.userId
                                //     )
                                // );

                                // await bot.api.answerWebAppQuery(quaryId, {
                                //     type: 'article',
                                //     id: quaryId,
                                //     title: 'Updated users!',
                                //     input_message_content: {
                                //         parse_mode: 'HTML',
                                //         message_text: MSG.chooseUserToMark(updatedUsers),
                                //     },
                                // });

                                return res.status(200).json(
                                    successResponse({
                                        data: updateSubscriptions,
                                    })
                                );
                            }
                        } else {
                            return res.status(400).json(
                                errorResponse({
                                    message: 'Не знайдено відповідних юзерів!',
                                    error: null,
                                })
                            );
                        }
                    }
                } else {
                    return res.status(400).json(
                        errorResponse({
                            message: 'Empty data!',
                            error: null,
                        })
                    );
                }
            } catch (error: any) {
                LOGGER.error('[web-data]', { metadata: error });
                return res
                    .status(500)
                    .json(errorResponse({ message: error, error }));
            }
        }
    );

    app.get(
        '/users',
        async (req: Request<{}, {}, {}>, res: Response<ResponseBody>) => {
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
    );

    // * Check if user has access
    app.post(
        '/user-info',
        async (
            req: Request<{}, {}, RequestBodyUserInfo>,
            res: Response<ResponseBody>
        ) => {
            try {
                const { userId } = req.body;
                // const accessDenied = await isAccessDenied(res, userId);
                // if (!accessDenied) return;

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
    );

    app.get(
        '/user-info',
        async (
            req: Request<{}, {}, {}, { userId: string }>,
            res: Response<ResponseBody>
        ) => {
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
    );

    app.listen(ENV_VARIABLES.PORT, () => {
        LOGGER.info(`Server started on port ${ENV_VARIABLES.PORT}...`);
    });
};

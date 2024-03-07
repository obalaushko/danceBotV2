import { Request, Response } from 'express';
import {
    errorResponse,
    successResponse,
} from '../response.js';
import { LOGGER } from '../../logger/index.js';
import { isAccessDenied } from '../../utils/utils.js';
import { getAllActiveUserUsers } from '../../mongodb/operations/users.js';
import { markLessonAsUsed } from '../../mongodb/operations/subscriptions.js';
import { RequestBodyScannerApi, ResponseBody } from '../types/index.js';

export default class ScannerController {
    constructor() {}

    async updateLessonUsage(
        req: Request<{}, {}, RequestBodyScannerApi>,
        res: Response<ResponseBody>
    ) {
        try {
            const { userId, userIds } = req.body;
            const accessDenied = await isAccessDenied(res, userId);
            if (!accessDenied) return;

            if (userIds) {
                const users = await getAllActiveUserUsers();

                console.log(userId, userIds)

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
}

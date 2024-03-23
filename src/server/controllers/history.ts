import { Request, Response } from 'express';
import {
    RequestBodyGetAllHistory,
    RequestBodyGetHistoryById,
    ResponseBody,
} from '../types/index.js';
import {
    getAllHistory,
    getUserHistory,
} from '../../mongodb/operations/history.js';
import { errorResponse, successResponse } from '../response.js';
import { LOGGER } from '../../logger/index.js';

export default class HistoryController {
    async getAllHistory(
        req: Request<object, object, RequestBodyGetAllHistory>,
        res: Response<ResponseBody>
    ) {
        try {
            const page = Number(req.query.page) || 1;
            const pageSize = Number(req.query.pageSize) || 20;

            const history = await getAllHistory(page, pageSize);

            if (history.list.length) {
                return res.status(200).json(
                    successResponse({
                        data: {
                            page,
                            pageSize,
                            totalPage: history.totalPages,
                            list: [...history.list],
                        },
                    })
                );
            } else {
                return res.status(200).json(
                    errorResponse({
                        message: 'History not found!',
                        error: null,
                    })
                );
            }
        } catch (error: any) {
            LOGGER.error('[history]', { metadata: error });
            return res
                .status(500)
                .json(errorResponse({ message: error, error }));
        }
    }

    async getHistoryById(
        req: Request<
            RequestBodyGetHistoryById,
            object,
            RequestBodyGetHistoryById
        >,
        res: Response<ResponseBody>
    ) {
        try {
            const { userId, page = 1, pageSize = 10 } = req.body;

            const history = await getUserHistory(userId, page, pageSize);

            if (history.list.length) {
                return res.status(200).json(
                    successResponse({
                        data: {
                            page,
                            pageSize,
                            totalPage: history.totalPages,
                            list: [...history.list],
                        },
                    })
                );
            } else {
                return res.status(200).json(
                    errorResponse({
                        message: 'User history not found!',
                        error: null,
                    })
                );
            }
        } catch (error: any) {
            LOGGER.error('[getHistoryById]', { metadata: error });
            return res
                .status(500)
                .json(errorResponse({ message: error, error }));
        }
    }
}

import { Request, Response } from 'express';
import { RequestBodyGetAllHistory, ResponseBody } from '../types/index.js';
import { getAllHistory } from '../../mongodb/operations/history.js';
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

            if (history.length) {
                return res.status(200).json(
                    successResponse({
                        data: {
                            page,
                            pageSize,
                            length: history.length,
                            list: history,
                        }
                    })
                );
            } else {
                return res.status(400).json(
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
}

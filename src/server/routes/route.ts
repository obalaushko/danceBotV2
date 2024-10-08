import { Request, Response, Router } from 'express';
import ScannerController from '../controllers/scanner.js';
import UserController from '../controllers/user.js';
import {
    RequestBodyGetAllHistory,
    RequestBodyGetHistoryById,
    RequestBodyScannerApi,
    RequestBodyUpdateUser,
    RequestBodyUserInfo,
    ResponseBody,
} from '../types/index.js';
import HistoryController from '../controllers/history.js';

const router = Router();
const scannerController = new ScannerController();
const userController = new UserController();
const historyController = new HistoryController();

/**
 * POST /web-data
 * Updates the lesson usage based on the request body.
 *
 * @param req - The request object.
 * @param res - The response object.
 */
router.post(
    '/web-data',
    (
        req: Request<object, object, RequestBodyScannerApi>,
        res: Response<ResponseBody>
    ) => scannerController.updateLessonUsage(req, res)
);

/**
 * POST /users
 * Retrieves all users.
 *
 * @param req - The request object.
 * @param res - The response object.
 */
router.post(
    '/users',
    (req: Request<object, object, object>, res: Response<ResponseBody>) =>
        userController.getAllUsers(req, res)
);

/**
 * POST /admin-info
 * Retrieves a user by ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 */
router.post(
    '/admin-info',
    (
        req: Request<object, object, RequestBodyUserInfo>,
        res: Response<ResponseBody>
    ) => userController.getUserById(req, res)
);

/**
 * GET /user-info
 * Retrieves a user with subscription by ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 */
router.get(
    '/user-info',
    (
        req: Request<object, object, object, { userId: string }>,
        res: Response<ResponseBody>
    ) => userController.getUserWithSubscriptionById(req, res)
);

/**
 * POST /user-update-data
 * Updates a user's data.
 *
 * @param req - The request object.
 * @param res - The response object.
 */
router.post(
    '/user-update-data',
    (
        req: Request<object, object, RequestBodyUpdateUser>,
        res: Response<ResponseBody>
    ) => userController.updateUser(req, res)
);

/**
 * GET /history-all
 * Retrieves all history.
 *
 * @param req - The request object.
 * @param res - The response object.
 */
router.get(
    '/history-all',
    (
        req: Request<object, object, RequestBodyGetAllHistory>,
        res: Response<ResponseBody>
    ) => historyController.getAllHistory(req, res)
);

router.post(
    '/history-user',
    (
        req: Request<
            RequestBodyGetHistoryById,
            object,
            RequestBodyGetHistoryById
        >,
        res: Response<ResponseBody>
    ) => historyController.getHistoryById(req, res)
);

router.post(
    '/payment-reminder',
    (
        req: Request<object, object, RequestBodyUserInfo>,
        res: Response<ResponseBody>
    ) => userController.paymentReminder(req, res)
);

export default router;

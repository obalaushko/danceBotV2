import { Request, Response, Router } from 'express';
import ScannerController from '../controllers/scanner.js';
import UserController from '../controllers/user.js';
import {
    RequestBodyScannerApi,
    RequestBodyUpdateUser,
    RequestBodyUserInfo,
    ResponseBody,
} from '../types/index.js';

const router = Router();
const scannerController = new ScannerController();
const userController = new UserController();

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
        req: Request<{}, {}, RequestBodyScannerApi>,
        res: Response<ResponseBody>
    ) => scannerController.updateLessonUsage(req, res)
);

/**
 * GET /users
 * Retrieves all users.
 *
 * @param req - The request object.
 * @param res - The response object.
 */
router.get('/users', (req: Request<{}, {}, {}>, res: Response<ResponseBody>) =>
    userController.getAllUsers(req, res)
);

/**
 * POST /user-info
 * Retrieves a user by ID.
 *
 * @param req - The request object.
 * @param res - The response object.
 */
router.post(
    '/user-info',
    (req: Request<{}, {}, RequestBodyUserInfo>, res: Response<ResponseBody>) =>
        userController.getUserById(req, res)
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
        req: Request<{}, {}, {}, { userId: string }>,
        res: Response<ResponseBody>
    ) => userController.getUserWithSubscriptionById(req, res)
);

router.post(
    '/user-update-data',
    (
        req: Request<{}, {}, RequestBodyUpdateUser>,
        res: Response<ResponseBody>
    ) => userController.updateUser(req, res)
);

export default router;

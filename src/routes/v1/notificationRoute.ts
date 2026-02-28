import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import notificationValidation from '~/validations/notificationValidation';
import notificationController from '~/controllers/notificationController';

const router = Router();

router.use(authenticate());

router.get('/', validate(notificationValidation.getNotifications), catchAsync(notificationController.getNotifications));
router.patch('/read-all', catchAsync(notificationController.markAllAsRead));
router.patch('/:notificationId/read', validate(notificationValidation.markAsRead), catchAsync(notificationController.markAsRead));

export default router;

import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import dashboardValidation from '~/validations/dashboardValidation';
import dashboardController from '~/controllers/dashboardController';

const router = Router();

router.get('/metrics', authenticate(), catchAsync(dashboardController.getMetrics));
router.get('/contracts', authenticate(), validate(dashboardValidation.getDashboardContracts), catchAsync(dashboardController.getDashboardContracts));
router.get('/activity', authenticate(), validate(dashboardValidation.getActivity), catchAsync(dashboardController.getRecentActivity));
router.get('/ai-insights', authenticate(), catchAsync(dashboardController.getAiInsights));
router.get('/metrics/:metricId/items', authenticate(), validate(dashboardValidation.getMetricItems), catchAsync(dashboardController.getMetricItems));

export default router;

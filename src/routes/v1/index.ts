import { Router } from 'express';
import authRoute from './authRoute';
import userRoute from './userRoute';
import roleRoute from './roleRoute';
import imageRoute from './imageRoute';
import healthRoute from './healthRoute';
import notificationRoute from './notificationRoute';
import contractRoute from './contractRoute';
import templateRoute from './templateRoute';
import clauseRoute from './clauseRoute';
import aiRoute from './aiRoute';
import dashboardRoute from './dashboardRoute';
import signatureRoute from './signatureRoute';
import jobRoute from './jobRoute';

const router = Router();

router.use('/health', healthRoute);
router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/roles', roleRoute);
router.use('/images', imageRoute);
router.use('/notifications', notificationRoute);
router.use('/contracts', contractRoute);
router.use('/templates', templateRoute);
router.use('/clauses', clauseRoute);
router.use('/ai', aiRoute);
router.use('/dashboard', dashboardRoute);
router.use('/signatures', signatureRoute);
router.use('/jobs', jobRoute);

export default router;

import { Router, Request, Response } from 'express';
import catchAsync from '~/utils/catchAsync';
import authenticate from '~/middlewares/authenticate';
import queue from '~/services/queueService';
import httpStatus from 'http-status';
import APIError from '~/utils/apiError';

const router = Router();

router.get(
	'/stats',
	authenticate(),
	catchAsync(async (req: Request, res: Response) => {
		const stats = queue.getStats();
		return res.json({ success: true, data: stats });
	})
);

router.get(
	'/:jobId',
	authenticate(),
	catchAsync(async (req: Request, res: Response) => {
		const job = queue.getJob(req.params.jobId);
		if (!job) {
			throw new APIError('Job not found', httpStatus.NOT_FOUND);
		}
		return res.json({
			success: true,
			data: {
				id: job.id,
				type: job.type,
				status: job.status,
				attempts: job.attempts,
				result: job.status === 'completed' ? job.result : undefined,
				error: job.status === 'failed' ? job.error : undefined,
				createdAt: job.createdAt,
				startedAt: job.startedAt,
				completedAt: job.completedAt
			}
		});
	})
);

router.post(
	'/purge',
	authenticate(),
	catchAsync(async (req: Request, res: Response) => {
		const count = queue.purgeCompleted();
		return res.json({ success: true, data: { purged: count } });
	})
);

export default router;

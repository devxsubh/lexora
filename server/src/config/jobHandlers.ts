import queue from '~/services/queueService';
import aiService from '~/services/aiService';
import exportService from '~/services/exportService';
import logger from '~/config/logger';

export interface GenerateContractJobData {
	userId: string;
	prompt: string;
}

export interface ReviewContractJobData {
	contractId: string;
	userId: string;
}

export interface ExportContractJobData {
	contractId: string;
	userId: string;
	format: string;
}

export function registerJobHandlers(): void {
	queue.register<GenerateContractJobData, unknown>('ai:generate-contract', async (data) => {
		return aiService.generateContract(data.userId, data.prompt);
	});

	queue.register<ReviewContractJobData, unknown>('ai:review-contract', async (data) => {
		return aiService.reviewContract(data.contractId, data.userId);
	});

	queue.register<ExportContractJobData, unknown>('export:contract', async (data) => {
		return exportService.downloadContract(data.contractId, data.userId, data.format);
	});

	queue.on('job:completed', (job) => {
		logger.info(`[JobHandlers] Job ${job.id} (${job.type}) completed`);
	});

	queue.on('job:failed', (job) => {
		logger.error(`[JobHandlers] Job ${job.id} (${job.type}) failed: ${job.error}`);
	});

	logger.info('[JobHandlers] All background job handlers registered');
}

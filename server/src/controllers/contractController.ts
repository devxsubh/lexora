import { Request, Response } from 'express';
import _ from 'lodash';
import contractService from '~/services/contractService';
import aiService from '~/services/aiService';
import exportService from '~/services/exportService';
import queue from '~/services/queueService';
import type { GenerateContractJobData, ExportContractJobData } from '~/config/jobHandlers';

export const listContracts = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const options = _.pick(req.query, ['page', 'limit', 'sortBy']);
	if (req.query.sortOrder) {
		(options as Record<string, unknown>).sortDirection = req.query.sortOrder;
	}
	const result = await contractService.listContracts(
		userId,
		options as import('~/services/contractService').ListContractsOptions
	);
	return res.json({ success: true, data: result });
};

export const getContract = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const contract = await contractService.getContract(req.params.id, userId);
	return res.json({ success: true, data: contract });
};

export const createContract = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const contract = await contractService.createContract(userId, req.body);
	return res.status(201).json({ success: true, data: contract });
};

export const updateContract = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const contract = await contractService.updateContract(req.params.id, userId, req.body);
	return res.json({ success: true, data: contract });
};

export const autosaveContract = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const contract = await contractService.autosaveContract(req.params.id, userId, req.body.content, req.body.lastModified);
	return res.json({ success: true, data: contract });
};

export const deleteContract = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	await contractService.deleteContract(req.params.id, userId);
	return res.json({ success: true, data: null });
};

export const generateContract = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const async = req.query.async === 'true';

	if (async) {
		const job = queue.add<GenerateContractJobData>('ai:generate-contract', {
			userId,
			prompt: req.body.prompt
		});
		return res.status(202).json({
			success: true,
			message: 'Contract generation queued',
			data: { jobId: job.id, status: job.status }
		});
	}

	const contract = await aiService.generateContract(userId, req.body.prompt);
	return res.status(201).json({ success: true, message: 'Contract generated successfully', data: contract });
};

export const generateContractStream = async (req: Request, res: Response): Promise<void> => {
	const userId = req.user!.id;

	res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
	res.setHeader('Cache-Control', 'no-cache, no-transform');
	res.setHeader('Connection', 'keep-alive');

	// If compression is enabled upstream, this hints not to buffer.
	res.setHeader('X-Accel-Buffering', 'no');

	const writeEvent = (payload: unknown) => {
		res.write(`data: ${JSON.stringify(payload)}\n\n`);
	};

	try {
		for await (const ev of aiService.generateContractStream(userId, req.body.prompt)) {
			writeEvent(ev);
			if (ev.type === 'done' || ev.type === 'error') {
				break;
			}
		}
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Failed to generate contract';
		writeEvent({ type: 'error', message });
	} finally {
		res.end();
	}
};

export const downloadContract = async (req: Request, res: Response): Promise<void | Response> => {
	const userId = req.user!.id;
	const format = (req.query.format as string) || 'pdf';
	const async = req.query.async === 'true';

	if (async) {
		const job = queue.add<ExportContractJobData>('export:contract', {
			contractId: req.params.id,
			userId,
			format
		});
		res.status(202).json({
			success: true,
			message: 'Export queued',
			data: { jobId: job.id, status: job.status }
		});
		return;
	}

	const result = await exportService.downloadContract(req.params.id, userId, format);
	res.set({
		'Content-Type': result.contentType,
		'Content-Disposition': `attachment; filename="${result.filename}"`,
		'Content-Length': result.buffer.length.toString()
	});
	res.send(result.buffer);
};

export const favoriteContract = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const contract = await contractService.favoriteContract(req.params.id, userId);
	return res.json({ success: true, data: contract });
};

export const unfavoriteContract = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const contract = await contractService.unfavoriteContract(req.params.id, userId);
	return res.json({ success: true, data: contract });
};

export default {
	listContracts,
	getContract,
	createContract,
	updateContract,
	autosaveContract,
	deleteContract,
	generateContract,
	generateContractStream,
	downloadContract,
	favoriteContract,
	unfavoriteContract
};

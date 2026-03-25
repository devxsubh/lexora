import { Request, Response } from 'express';
import signatureService from '~/services/signatureService';

export const requestSignatures = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const result = await signatureService.requestSignatures(req.params.contractId, userId, req.body.signers, req.body.message);
	return res.status(201).json({
		success: true,
		data: {
			requestId: result.id,
			status: result.status,
			sentTo: result.signers.map((s) => s.email)
		}
	});
};

export const listSignatures = async (req: Request, res: Response): Promise<Response> => {
	const userId = req.user!.id;
	const signatures = await signatureService.listSignatures(req.params.contractId, userId);
	return res.json({ success: true, data: signatures });
};

export const signDocument = async (req: Request, res: Response): Promise<Response> => {
	const result = await signatureService.signDocument(
		req.params.contractId,
		req.body.signature,
		req.body.signerName,
		req.body.requestId
	);
	return res.json({ success: true, data: result });
};

export default { requestSignatures, listSignatures, signDocument };

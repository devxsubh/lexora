import { Request, Response } from 'express';
import httpStatus from 'http-status';
import APIError from '~/utils/apiError';
import imageService from '~/services/imageService';

export const uploadImage = async (req: Request, res: Response): Promise<Response> => {
	if (!req.file || !req.file.buffer) {
		throw new APIError('Please provide an image', httpStatus.BAD_REQUEST);
	}
	const result = await imageService.uploadImage(req.file.buffer, req.file.originalname);
	return res.json({ success: true, data: result });
};

export default { uploadImage };

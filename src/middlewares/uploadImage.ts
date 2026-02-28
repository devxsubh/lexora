import multer from 'multer';
import path from 'path';
import APIError from '~/utils/apiError';
import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif'];

const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 6 * 1024 * 1024
	},
	fileFilter: (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
		const ext = path.extname(file.originalname).toLowerCase();
		if (!ALLOWED_EXTENSIONS.includes(ext)) {
			return callback(new APIError('File type not allowed', httpStatus.BAD_REQUEST) as unknown as Error);
		}
		if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
			return callback(new APIError('Invalid file content type', httpStatus.BAD_REQUEST) as unknown as Error);
		}
		callback(null, true);
	}
}).single('image');

const uploadImage = (req: Request, res: Response, next: NextFunction): void => {
	upload(req, res, (err: unknown) => {
		if (err instanceof multer.MulterError) {
			return next(new APIError(err.message, httpStatus.BAD_REQUEST));
		}
		if (err) {
			return next(err);
		}
		return next();
	});
};

export default uploadImage;

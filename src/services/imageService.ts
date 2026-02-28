import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import cloudinaryService from './cloudinaryService';
import ResizeImage from '~/utils/resizeImage';

const AVATAR_SIZE = 300;
const LOCAL_IMAGES_DIR = 'public/images';

export interface UploadResult {
	image: string;
}

export async function uploadImage(buffer: Buffer, originalName?: string): Promise<UploadResult> {
	if (cloudinaryService.isCloudinaryConfigured()) {
		const resized = await sharp(buffer).resize(AVATAR_SIZE, AVATAR_SIZE).toBuffer();
		const result = await cloudinaryService.uploadBuffer(resized, { folder: 'lexora/images' });
		return { image: result.secure_url };
	}

	if (!fs.existsSync(LOCAL_IMAGES_DIR)) {
		fs.mkdirSync(LOCAL_IMAGES_DIR, { recursive: true });
	}
	const ext = originalName ? path.extname(originalName) || '.jpg' : '.jpg';
	const fileName = uuidv4() + ext;
	const filePath = path.join(LOCAL_IMAGES_DIR, fileName);
	fs.writeFileSync(filePath, buffer);
	const resizedFileName = await ResizeImage(LOCAL_IMAGES_DIR, fileName);
	return { image: resizedFileName };
}

export default {
	uploadImage
};

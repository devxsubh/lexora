import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import config from '~/config/config';

const isConfigured =
	Boolean(config.CLOUDINARY_CLOUD_NAME) && Boolean(config.CLOUDINARY_API_KEY) && Boolean(config.CLOUDINARY_API_SECRET);

if (isConfigured) {
	cloudinary.config({
		cloud_name: config.CLOUDINARY_CLOUD_NAME,
		api_key: config.CLOUDINARY_API_KEY,
		api_secret: config.CLOUDINARY_API_SECRET
	});
}

export interface CloudinaryUploadResult {
	url: string;
	secure_url: string;
	public_id: string;
}

export async function uploadBuffer(
	buffer: Buffer,
	options: { folder?: string; public_id?: string } = {}
): Promise<CloudinaryUploadResult> {
	if (!isConfigured) {
		throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.');
	}
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder: options.folder ?? 'lexora',
				public_id: options.public_id,
				resource_type: 'image'
			},
			(err, result) => {
				if (err) return reject(err);
				if (!result || typeof result.secure_url !== 'string') {
					return reject(new Error('Cloudinary upload failed'));
				}
				resolve({
					url: result.url,
					secure_url: result.secure_url,
					public_id: result.public_id
				});
			}
		);
		streamifier.createReadStream(buffer).pipe(uploadStream);
	});
}

export function isCloudinaryConfigured(): boolean {
	return isConfigured;
}

export async function pingCloudinary(): Promise<void> {
	if (!isConfigured) {
		return;
	}
	await new Promise<void>((resolve, reject) => {
		cloudinary.api.ping((err: Error | undefined) => {
			if (err) reject(err);
			else resolve();
		});
	});
}

export default {
	uploadBuffer,
	isCloudinaryConfigured,
	pingCloudinary
};

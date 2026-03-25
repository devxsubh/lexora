import sharp from 'sharp';

export interface ResizeOptions {
	width?: number;
	height?: number;
}

const defaultOptions: Required<ResizeOptions> = { width: 300, height: 300 };

const ResizeImage = async (folder: string, fileName: string, options: ResizeOptions = defaultOptions): Promise<string> => {
	const opts = { ...defaultOptions, ...options };
	const newFileName = `${opts.width}x${opts.height}-${fileName}`;
	await sharp(`${folder}/${fileName}`).resize(opts.width, opts.height).toFile(`${folder}/${newFileName}`);
	return newFileName;
};

export default ResizeImage;

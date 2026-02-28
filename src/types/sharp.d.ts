declare module 'sharp' {
	function sharp(input?: string | Buffer): sharp.Sharp;
	namespace sharp {
		interface Sharp {
			resize(w?: number, h?: number): Sharp;
			toFile(path: string): Promise<{ filename: string }>;
			toBuffer(): Promise<Buffer>;
		}
	}
	export default sharp;
}

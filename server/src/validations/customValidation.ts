// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mongoId = (value: string, helpers: any): string => {
	if (!/^(0x|0h)?[0-9A-F]{24}$/i.test(value)) {
		return helpers.message('{{#label}} must be a valid mongo id') as unknown as string;
	}
	return value;
};

export interface ApiErrorItem {
	message: string;
	location?: string;
	locationType?: string;
}

function normalizeToErrors(message: string | ApiErrorItem[]): ApiErrorItem[] {
	if (Array.isArray(message)) {
		return message.map((item) =>
			typeof item === 'object' && item !== null && 'message' in item
				? {
						message: String((item as ApiErrorItem).message),
						...(typeof (item as ApiErrorItem).location !== 'undefined' && {
							location: (item as ApiErrorItem).location
						}),
						...(typeof (item as ApiErrorItem).locationType !== 'undefined' && {
							locationType: (item as ApiErrorItem).locationType
						})
				  }
				: { message: String(item) }
		);
	}
	return [{ message: String(message) }];
}

export default class APIError extends Error {
	status: number;

	isOperational: boolean;

	errors: ApiErrorItem[];

	constructor(message: string | ApiErrorItem[], status: number, isOperational = true) {
		const errors = normalizeToErrors(message);
		const firstMessage = errors[0]?.message ?? 'Error';
		super(firstMessage);
		this.name = this.constructor.name;
		this.status = status;
		this.isOperational = isOperational;
		this.errors = errors;
		Error.captureStackTrace(this, this.constructor);
	}
}

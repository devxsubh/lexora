import { Types } from 'mongoose';

declare global {
	namespace Express {
		interface Request {
			id?: string;
		}
		// Augment Passport's empty User so req.user has id and email in controllers
		interface User {
			id: string;
			_id?: Types.ObjectId;
			email?: string;
			[key: string]: unknown;
		}
	}
}

export {};

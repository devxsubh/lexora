import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import _ from 'lodash';

interface ValidationSchema {
	params?: Joi.ObjectSchema;
	query?: Joi.ObjectSchema;
	body?: Joi.ObjectSchema;
}

const validate =
	(schema: ValidationSchema) =>
	(req: Request, res: Response, next: NextFunction): void => {
		const validSchema = _.pick(schema, ['params', 'query', 'body']);
		const object = _.pick(req, Object.keys(validSchema));
		const { error, value } = Joi.compile(validSchema)
			.prefs({
				errors: { label: 'path', wrap: { label: false } },
				abortEarly: false
			})
			.validate(object);
		if (error) {
			return next(error);
		}
		Object.assign(req, value);
		return next();
	};

export default validate;

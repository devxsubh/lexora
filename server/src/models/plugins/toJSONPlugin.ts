import type { Schema } from 'mongoose';

interface TransformRet {
	_id?: unknown;
	id?: string;
	__v?: number;
	[key: string]: unknown;
}

function normalizeId(ret: TransformRet): void {
	if (ret._id && typeof ret._id === 'object' && 'toString' in ret._id) {
		if (typeof ret.id === 'undefined') {
			ret.id = (ret._id as { toString(): string }).toString();
		}
	}
	if (typeof ret._id !== 'undefined') {
		delete ret._id;
	}
}

function removePrivatePaths(ret: TransformRet, schema: Schema): void {
	for (const path of Object.keys(schema.paths)) {
		const pathObj = schema.paths[path] as { options?: { private?: boolean } };
		if (pathObj?.options?.private && typeof ret[path] !== 'undefined') {
			delete ret[path];
		}
	}
}

function removeVersion(ret: TransformRet): void {
	if (typeof ret.__v !== 'undefined') {
		delete ret.__v;
	}
}

function toJSON(schema: Schema): void {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const schemaOpts = (schema as any).options as {
		toJSON?: {
			transform?: (doc: unknown, ret: TransformRet, options: unknown) => unknown;
			removePrivatePaths?: boolean;
			removeVersion?: boolean;
			normalizeId?: boolean;
		};
	};
	let transform: ((doc: unknown, ret: TransformRet, options: unknown) => unknown) | undefined;
	if (schemaOpts.toJSON?.transform) {
		transform = schemaOpts.toJSON.transform;
	}

	schemaOpts.toJSON = Object.assign(schemaOpts.toJSON || {}, {
		transform(doc: unknown, ret: TransformRet, options: unknown) {
			if (schemaOpts.toJSON?.removePrivatePaths !== false) {
				removePrivatePaths(ret, schema);
			}
			if (schemaOpts.toJSON?.removeVersion !== false) {
				removeVersion(ret);
			}
			if (schemaOpts.toJSON?.normalizeId !== false) {
				normalizeId(ret);
			}
			if (transform) {
				return transform(doc, ret, options);
			}
			return ret;
		}
	});
}

export default toJSON;

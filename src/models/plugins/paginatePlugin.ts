import type { Schema } from 'mongoose';

export interface PaginateOptions {
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
	page?: number;
	limit?: number;
}

export interface PaginatePluginOptions {
	allowedSortBy?: string[];
	maxLimit?: number;
}

const DEFAULT_MAX_LIMIT = 100;

const paginate = (schema: Schema, pluginOptions?: PaginatePluginOptions): void => {
	const allowedSortBy = new Set(pluginOptions?.allowedSortBy ?? []);
	const maxLimit = pluginOptions?.maxLimit ?? DEFAULT_MAX_LIMIT;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(schema.statics as any).paginate = async function paginateFunc(
		options: PaginateOptions,
		populate: string | undefined,
		query: Record<string, unknown>
	) {
		const rawSortBy = options.sortBy ?? 'createdAt';
		const sortBy = allowedSortBy.size > 0 && !allowedSortBy.has(rawSortBy) ? 'createdAt' : rawSortBy;
		const sortDirection = options.sortDirection === 'asc' ? 'asc' : 'desc';
		const page = options.page && Number(options.page) > 0 ? Number(options.page) : 1;
		const rawLimit = options.limit && Number(options.limit) > 0 ? Number(options.limit) : 10;
		const limit = Math.min(rawLimit, maxLimit);
		const skip = (page - 1) * limit;

		const countPromise = this.countDocuments(query).exec();
		let docsPromise = this.find(query)
			.sort({ [sortBy]: sortDirection })
			.skip(skip)
			.limit(limit);

		if (populate) {
			populate.split(' ').forEach((p) => {
				const parts = p.split('.');
				if (parts.length === 1) {
					docsPromise = docsPromise.populate(parts[0]);
				} else {
					const pop = parts.reverse().reduce(
						(a: Record<string, unknown>, b: string) => ({
							path: b,
							populate: Object.keys(a).length ? a : undefined
						}),
						{} as Record<string, unknown>
					);
					docsPromise = docsPromise.populate(pop);
				}
			});
		}

		docsPromise = docsPromise.exec();

		const [totalResults, results] = await Promise.all([countPromise, docsPromise]);

		return {
			results,
			totalResults
		};
	};
};

export default paginate;

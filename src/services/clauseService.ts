import Clause, { IClause, IClauseDocument } from '~/models/clauseModel';
import { NotFoundError } from '~/utils/domainErrors';
import escapeRegex from '~/utils/escapeRegex';

export interface ListClausesOptions {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortDirection?: string;
}

export async function listClauses(options: ListClausesOptions, category?: string, q?: string) {
	const query: Record<string, unknown> = {};
	if (category) query.category = category;
	if (q && q.trim()) {
		const escaped = escapeRegex(q.trim());
		query.$or = [
			{ title: { $regex: escaped, $options: 'i' } },
			{ category: { $regex: escaped, $options: 'i' } },
			{ tags: { $regex: escaped, $options: 'i' } }
		];
	}

	const result = await Clause.paginate(options as Record<string, unknown>, undefined, query);
	return {
		clauses: result.results,
		total: result.totalResults
	};
}

export async function getClause(id: string): Promise<IClauseDocument> {
	const clause = await Clause.findById(id);
	if (!clause) throw new NotFoundError('Clause not found');
	return clause;
}

export async function createClause(body: Partial<IClause>): Promise<IClauseDocument> {
	return Clause.create(body);
}

export async function updateClause(id: string, body: Partial<IClause>): Promise<IClauseDocument> {
	const clause = await Clause.findById(id);
	if (!clause) throw new NotFoundError('Clause not found');
	Object.assign(clause, body);
	await clause.save();
	return clause;
}

export async function deleteClause(id: string): Promise<void> {
	const clause = await Clause.findById(id);
	if (!clause) throw new NotFoundError('Clause not found');
	await clause.deleteOne();
}

export default { listClauses, getClause, createClause, updateClause, deleteClause };

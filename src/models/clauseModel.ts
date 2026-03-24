import mongoose, { Types } from 'mongoose';
import paginate from './plugins/paginatePlugin';
import toJSON from './plugins/toJSONPlugin';

export interface IClause {
	title: string;
	content: string;
	category: string;
	tags: string[];
	usageCount: number;
	userId?: Types.ObjectId;
	createdAt?: Date;
	updatedAt?: Date;
}

interface IClauseModel extends mongoose.Model<IClause> {
	paginate(
		options: Record<string, unknown>,
		populate: string | undefined,
		query?: Record<string, unknown>
	): Promise<{ results: unknown[]; totalResults: number }>;
}

export type IClauseDocument = mongoose.HydratedDocument<IClause>;

const clauseSchema = new mongoose.Schema<IClause>(
	{
		title: { type: String, required: true },
		content: { type: String, required: true },
		category: { type: String, required: true },
		tags: [{ type: String }],
		usageCount: { type: Number, default: 0 },
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', index: true }
	},
	{ timestamps: true, toJSON: { virtuals: true } }
);

clauseSchema.index({ category: 1 });
clauseSchema.index({ tags: 1 });

clauseSchema.plugin(toJSON);
clauseSchema.plugin(paginate, {
	allowedSortBy: ['title', 'category', 'usageCount', 'createdAt', 'updatedAt'],
	maxLimit: 100
});

const Clause = mongoose.model<IClause, IClauseModel>('clauses', clauseSchema);
export default Clause;

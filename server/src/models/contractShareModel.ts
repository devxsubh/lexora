import mongoose, { Types } from 'mongoose';
import paginate from './plugins/paginatePlugin';
import toJSON from './plugins/toJSONPlugin';

export type ShareRole = 'viewer' | 'editor';

export interface IContractShare {
	contractId: Types.ObjectId;
	email: string;
	userId?: Types.ObjectId;
	role: ShareRole;
	addedBy: Types.ObjectId;
	createdAt?: Date;
	updatedAt?: Date;
}

interface IContractShareModel extends mongoose.Model<IContractShare> {
	paginate(
		options: Record<string, unknown>,
		populate: string | undefined,
		query?: Record<string, unknown>
	): Promise<{ results: unknown[]; totalResults: number }>;
}

export type IContractShareDocument = mongoose.HydratedDocument<IContractShare>;

const contractShareSchema = new mongoose.Schema<IContractShare>(
	{
		contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'contracts', required: true, index: true },
		email: { type: String, required: true, index: true },
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
		role: { type: String, enum: ['viewer', 'editor'], default: 'viewer' },
		addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }
	},
	{ timestamps: true, toJSON: { virtuals: true } }
);

contractShareSchema.index({ contractId: 1, email: 1 }, { unique: true });

contractShareSchema.plugin(toJSON);
contractShareSchema.plugin(paginate, {
	allowedSortBy: ['createdAt', 'updatedAt', 'email', 'role'],
	maxLimit: 100
});

const ContractShare = mongoose.model<IContractShare, IContractShareModel>('contractShares', contractShareSchema);
export default ContractShare;

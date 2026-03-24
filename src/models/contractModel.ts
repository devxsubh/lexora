import mongoose, { Types } from 'mongoose';
import paginate from './plugins/paginatePlugin';
import toJSON from './plugins/toJSONPlugin';
import { NotFoundError } from '~/utils/domainErrors';

export interface IBlock {
	id?: string;
	type: string;
	props?: Record<string, unknown>;
	content?: Array<{ type: string; text: string; styles?: Record<string, unknown> }>;
	children?: IBlock[];
}

export interface IContract {
	title: string;
	content: IBlock[];
	status: 'draft' | 'reviewing' | 'finalized';
	userId: Types.ObjectId;
	lexiId?: string;
	metadata?: Record<string, unknown>;
	isFavorite: boolean;
	party?: string;
	contractType?: string;
	aiRiskScore?: number;
	riskLevel?: string;
	lifecycleStage?: number;
	effectiveDate?: Date;
	summary?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

interface IContractModel extends mongoose.Model<IContract> {
	paginate(
		options: Record<string, unknown>,
		populate: string | undefined,
		query?: Record<string, unknown>
	): Promise<{ results: unknown[]; totalResults: number }>;
	getContractById(id: Types.ObjectId | string): Promise<IContractDocument | null>;
}

export type IContractDocument = mongoose.HydratedDocument<IContract>;

const contractSchema = new mongoose.Schema<IContract>(
	{
		title: { type: String, required: true, default: 'Untitled Agreement' },
		content: { type: mongoose.Schema.Types.Mixed, default: [] },
		status: { type: String, enum: ['draft', 'reviewing', 'finalized'], default: 'draft' },
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
		lexiId: { type: String },
		metadata: { type: mongoose.Schema.Types.Mixed },
		isFavorite: { type: Boolean, default: false },
		party: { type: String },
		contractType: { type: String },
		aiRiskScore: { type: Number, min: 0, max: 100 },
		riskLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
		lifecycleStage: { type: Number, min: 0, max: 5 },
		effectiveDate: { type: Date },
		summary: { type: String }
	},
	{ timestamps: true, toJSON: { virtuals: true } }
);

contractSchema.index({ userId: 1, createdAt: -1 });
contractSchema.index({ status: 1 });

contractSchema.plugin(toJSON);
contractSchema.plugin(paginate, {
	allowedSortBy: ['title', 'createdAt', 'updatedAt', 'status', 'contractType', 'aiRiskScore'],
	maxLimit: 100
});

class ContractClass {
	static async getContractById(this: IContractModel, id: Types.ObjectId | string): Promise<IContractDocument | null> {
		return this.findById(id) as unknown as Promise<IContractDocument | null>;
	}
}

contractSchema.loadClass(ContractClass);

const Contract = mongoose.model<IContract, IContractModel>('contracts', contractSchema);
export default Contract;

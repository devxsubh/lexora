import mongoose, { Types } from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

export interface ISigner {
	email: string;
	name: string;
	roleId?: string;
	roleName?: string;
	status: 'pending' | 'signed' | 'declined';
	signedAt?: Date;
	signatureData?: string;
}

export interface ISignatureRequest {
	contractId: Types.ObjectId;
	userId: Types.ObjectId;
	status: 'pending' | 'completed' | 'cancelled';
	message?: string;
	signers: ISigner[];
	createdAt?: Date;
	updatedAt?: Date;
}

export type ISignatureRequestDocument = mongoose.HydratedDocument<ISignatureRequest>;

const signerSchema = new mongoose.Schema<ISigner>(
	{
		email: { type: String, required: true },
		name: { type: String, required: true },
		roleId: { type: String },
		roleName: { type: String },
		status: { type: String, enum: ['pending', 'signed', 'declined'], default: 'pending' },
		signedAt: { type: Date },
		signatureData: { type: String }
	},
	{ _id: true }
);

const signatureRequestSchema = new mongoose.Schema<ISignatureRequest>(
	{
		contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'contracts', required: true, index: true },
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
		status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
		message: { type: String },
		signers: [signerSchema]
	},
	{ timestamps: true, toJSON: { virtuals: true } }
);

signatureRequestSchema.plugin(toJSON);

const SignatureRequest = mongoose.model<ISignatureRequest>('signature_requests', signatureRequestSchema);
export default SignatureRequest;

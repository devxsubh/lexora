import mongoose, { Types } from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

export interface IAiChatSession {
	contractId: Types.ObjectId;
	userId: Types.ObjectId;
	createdAt?: Date;
	updatedAt?: Date;
}

export type IAiChatSessionDocument = mongoose.HydratedDocument<IAiChatSession>;

const aiChatSessionSchema = new mongoose.Schema<IAiChatSession>(
	{
		contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'contracts', required: true, index: true },
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true }
	},
	{ timestamps: true, toJSON: { virtuals: true } }
);

aiChatSessionSchema.index({ contractId: 1, userId: 1 });
aiChatSessionSchema.plugin(toJSON);

const AiChatSession = mongoose.model<IAiChatSession>('ai_chat_sessions', aiChatSessionSchema);
export default AiChatSession;

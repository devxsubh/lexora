import mongoose, { Types } from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

export interface IAiMessage {
	sessionId: Types.ObjectId;
	role: 'user' | 'assistant';
	content: string;
	createdAt?: Date;
}

export type IAiMessageDocument = mongoose.HydratedDocument<IAiMessage>;

const aiMessageSchema = new mongoose.Schema<IAiMessage>(
	{
		sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ai_chat_sessions', required: true, index: true },
		role: { type: String, enum: ['user', 'assistant'], required: true },
		content: { type: String, required: true }
	},
	{ timestamps: true, toJSON: { virtuals: true } }
);

aiMessageSchema.plugin(toJSON);

const AiMessage = mongoose.model<IAiMessage>('ai_messages', aiMessageSchema);
export default AiMessage;

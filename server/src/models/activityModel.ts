import mongoose, { Types } from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

export interface IActivity {
	userId: Types.ObjectId;
	contractId?: Types.ObjectId;
	text: string;
	type: 'signature' | 'ai-review' | 'lifecycle' | 'edit' | 'create';
	createdAt?: Date;
}

export type IActivityDocument = mongoose.HydratedDocument<IActivity>;

const activitySchema = new mongoose.Schema<IActivity>(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
		contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'contracts', index: true },
		text: { type: String, required: true },
		type: { type: String, enum: ['signature', 'ai-review', 'lifecycle', 'edit', 'create'], required: true }
	},
	{ timestamps: true, toJSON: { virtuals: true } }
);

activitySchema.index({ createdAt: -1 });
activitySchema.plugin(toJSON);

const Activity = mongoose.model<IActivity>('activities', activitySchema);
export default Activity;

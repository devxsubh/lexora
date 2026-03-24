import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

export interface ITemplate {
	name: string;
	label: string;
	description: string;
	category: string;
	content: Record<string, unknown>[];
	createdAt?: Date;
	updatedAt?: Date;
}

export type ITemplateDocument = mongoose.HydratedDocument<ITemplate>;

const templateSchema = new mongoose.Schema<ITemplate>(
	{
		name: { type: String, required: true, unique: true },
		label: { type: String, required: true },
		description: { type: String, default: '' },
		category: { type: String, default: 'General' },
		content: { type: mongoose.Schema.Types.Mixed, default: [] }
	},
	{ timestamps: true, toJSON: { virtuals: true } }
);

templateSchema.plugin(toJSON);

const Template = mongoose.model<ITemplate>('templates', templateSchema);
export default Template;

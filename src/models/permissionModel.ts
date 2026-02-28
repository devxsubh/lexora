import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

export interface IPermission {
	controller: string;
	action: string;
	enabled?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

const permissionSchema = new mongoose.Schema<IPermission>(
	{
		controller: {
			type: String,
			required: true
		},
		action: {
			type: String,
			required: true
		},
		enabled: {
			type: Boolean,
			default: true
		}
	},
	{
		timestamps: true
	}
);

permissionSchema.index({ controller: 1, action: 1 }, { unique: true });

permissionSchema.plugin(toJSON);

const Permission = mongoose.model<IPermission>('permissions', permissionSchema);

export default Permission;

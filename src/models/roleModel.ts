import mongoose, { Types } from 'mongoose';
import { ConflictError, NotFoundError, ValidationError } from '~/utils/domainErrors';
import paginate from './plugins/paginatePlugin';
import toJSON from './plugins/toJSONPlugin';
import Permission from './permissionModel';

export interface IRole {
	name: string;
	description?: string;
	permissions?: Types.ObjectId[];
	createdAt?: Date;
	updatedAt?: Date;
}

interface IRoleModel extends mongoose.Model<IRole> {
	paginate(
		options: Record<string, unknown>,
		populate: string,
		query?: Record<string, unknown>
	): Promise<{ results: unknown[]; totalResults: number }>;
	isNameAlreadyExists(name: string, excludeUserId?: Types.ObjectId | string): Promise<boolean>;
	getRoleByName(name: string): Promise<mongoose.HydratedDocument<IRole> | null>;
	ensureDefaultUserRole(): Promise<mongoose.HydratedDocument<IRole>>;
	getRoleById(id: Types.ObjectId | string): Promise<mongoose.HydratedDocument<IRole> | null>;
	createRole(body: Partial<IRole>): Promise<mongoose.HydratedDocument<IRole>>;
	updateRoleById(roleId: Types.ObjectId | string, body: Partial<IRole>): Promise<mongoose.HydratedDocument<IRole>>;
	deleteRoleById(roleId: Types.ObjectId | string): Promise<mongoose.HydratedDocument<IRole> | null>;
}

const roleSchema = new mongoose.Schema<IRole>(
	{
		name: {
			type: String,
			required: true,
			unique: true
		},
		description: {
			type: String,
			default: ''
		},
		permissions: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'permissions'
			}
		]
	},
	{
		timestamps: true
	}
);

roleSchema.plugin(toJSON);
roleSchema.plugin(paginate, {
	allowedSortBy: ['name', 'description', 'createdAt', 'updatedAt'],
	maxLimit: 100
});

class RoleClass {
	static async isNameAlreadyExists(this: IRoleModel, name: string, excludeUserId?: Types.ObjectId | string): Promise<boolean> {
		return !!(await this.findOne({ name, _id: { $ne: excludeUserId } }));
	}

	static async getRoleByName(this: IRoleModel, name: string): Promise<mongoose.HydratedDocument<IRole> | null> {
		return this.findOne({ name });
	}

	static async ensureDefaultUserRole(this: IRoleModel): Promise<mongoose.HydratedDocument<IRole>> {
		const role = await this.findOneAndUpdate(
			{ name: 'User' },
			{ $setOnInsert: { name: 'User', permissions: [], description: '' } },
			{ upsert: true, new: true }
		);
		return role;
	}

	static async getRoleById(this: IRoleModel, id: Types.ObjectId | string): Promise<mongoose.HydratedDocument<IRole> | null> {
		return this.findById(id);
	}

	static async createRole(this: IRoleModel, body: Partial<IRole>): Promise<mongoose.HydratedDocument<IRole>> {
		if (await this.isNameAlreadyExists(body.name!)) {
			throw new ConflictError('Name already exists');
		}
		if (body.permissions) {
			await Promise.all(
				body.permissions.map(async (pid) => {
					if (!(await Permission.findById(pid))) {
						throw new ValidationError('Permissions not exist');
					}
				})
			);
		}
		return this.create(body);
	}

	static async updateRoleById(
		this: IRoleModel,
		roleId: Types.ObjectId | string,
		body: Partial<IRole>
	): Promise<mongoose.HydratedDocument<IRole>> {
		const role = await this.getRoleById(roleId);
		if (!role) {
			throw new NotFoundError('Role not found');
		}
		if (await this.isNameAlreadyExists(body.name!, roleId)) {
			throw new ConflictError('Name already exists');
		}
		if (body.permissions) {
			await Promise.all(
				body.permissions.map(async (pid) => {
					if (!(await Permission.findById(pid))) {
						throw new ValidationError('Permissions not exist');
					}
				})
			);
		}
		Object.assign(role, body);
		return role.save();
	}

	static async deleteRoleById(
		this: IRoleModel,
		roleId: Types.ObjectId | string
	): Promise<mongoose.HydratedDocument<IRole> | null> {
		const role = await this.getRoleById(roleId);
		if (!role) {
			throw new NotFoundError('Role not found');
		}
		await role.deleteOne();
		return role;
	}
}

roleSchema.loadClass(RoleClass);

const Role = mongoose.model<IRole, IRoleModel>('roles', roleSchema);

export default Role;

import mongoose, { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import paginate from './plugins/paginatePlugin';
import toJSON from './plugins/toJSONPlugin';
import { ConflictError, NotFoundError, ValidationError } from '~/utils/domainErrors';
import Role from './roleModel';
import config from '~/config/config';

export interface IUser {
	name: string;
	email: string;
	password: string;
	googleId?: string;
	avatar?: string;
	confirmed?: boolean;
	roles?: Types.ObjectId[];
	createdAt?: Date;
	updatedAt?: Date;
	id?: string; // virtual from toJSON plugin
}

interface IUserModel extends mongoose.Model<IUser> {
	paginate(
		options: Record<string, unknown>,
		populate: string,
		query?: Record<string, unknown>
	): Promise<{ results: unknown[]; totalResults: number }>;
	isEmailAlreadyExists(email: string, excludeUserId?: Types.ObjectId | string): Promise<boolean>;
	isRoleIdAlreadyExists(roleId: Types.ObjectId | string, excludeUserId?: Types.ObjectId | string): Promise<boolean>;
	getUserById(id: Types.ObjectId | string): Promise<IUserDocument | null>;
	getUserByIdWithRoles(id: Types.ObjectId | string): Promise<IUserDocument | null>;
	getUserByEmail(email: string): Promise<IUserDocument | null>;
	getUserByGoogleId(googleId: string): Promise<IUserDocument | null>;
	findOrCreateFromGoogle(profile: {
		id: string;
		emails?: { value: string }[];
		name?: { givenName?: string; familyName?: string };
		displayName?: string;
		photos?: { value: string }[];
	}): Promise<IUserDocument>;
	createUser(body: Partial<IUser>): Promise<IUserDocument>;
	updateUserById(userId: Types.ObjectId | string, body: Partial<IUser>): Promise<IUserDocument>;
	deleteUserById(userId: Types.ObjectId | string): Promise<IUserDocument | null>;
}

export interface IUserDocument extends mongoose.HydratedDocument<IUser> {
	isPasswordMatch(password: string): boolean;
}

const userSchema = new mongoose.Schema<IUser>(
	{
		name: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true,
			unique: true
		},
		password: {
			type: String,
			required: false,
			default: null,
			private: true
		},
		googleId: {
			type: String,
			required: false,
			sparse: true,
			unique: true
		},
		avatar: {
			type: String,
			default: 'avatar.png'
		},
		confirmed: {
			type: Boolean,
			default: false
		},
		roles: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'roles'
			}
		]
	},
	{
		timestamps: true,
		toJSON: { virtuals: true }
	}
);

userSchema.index({ roles: 1 });

userSchema.plugin(toJSON);
userSchema.plugin(paginate, {
	allowedSortBy: ['name', 'email', 'createdAt', 'updatedAt'],
	maxLimit: 100
});

userSchema.virtual('avatarUrl').get(function (this: IUserDocument) {
	if (!this.avatar) return `${config.IMAGE_URL}/avatar.png`;
	if (this.avatar.startsWith('http://') || this.avatar.startsWith('https://')) {
		return this.avatar;
	}
	return `${config.IMAGE_URL}/${this.avatar}`;
});

class UserClass {
	static async isEmailAlreadyExists(this: IUserModel, email: string, excludeUserId?: Types.ObjectId | string): Promise<boolean> {
		return !!(await this.findOne({ email, _id: { $ne: excludeUserId } }));
	}

	static async isRoleIdAlreadyExists(
		this: IUserModel,
		roleId: Types.ObjectId | string,
		excludeUserId?: Types.ObjectId | string
	): Promise<boolean> {
		return !!(await this.findOne({ roles: roleId, _id: { $ne: excludeUserId } }));
	}

	static async getUserById(this: IUserModel, id: Types.ObjectId | string): Promise<IUserDocument | null> {
		return this.findById(id) as unknown as Promise<IUserDocument | null>;
	}

	static async getUserByIdWithRoles(this: IUserModel, id: Types.ObjectId | string): Promise<IUserDocument | null> {
		return this.findById(id).populate({
			path: 'roles',
			select: 'name description createdAt updatedAt'
		}) as unknown as Promise<IUserDocument | null>;
	}

	static async getUserByEmail(this: IUserModel, email: string): Promise<IUserDocument | null> {
		return this.findOne({ email }) as unknown as Promise<IUserDocument | null>;
	}

	static async getUserByGoogleId(this: IUserModel, googleId: string): Promise<IUserDocument | null> {
		return this.findOne({ googleId }) as unknown as Promise<IUserDocument | null>;
	}

	static async findOrCreateFromGoogle(
		this: IUserModel,
		profile: {
			id: string;
			emails?: { value: string }[];
			name?: { givenName?: string; familyName?: string };
			displayName?: string;
			photos?: { value: string }[];
		}
	): Promise<IUserDocument> {
		const googleId = profile.id;
		const existing = await this.getUserByGoogleId(googleId);
		if (existing) return existing;
		const email = profile.emails?.[0]?.value;
		if (email) {
			const byEmail = await this.getUserByEmail(email);
			if (byEmail) {
				byEmail.googleId = googleId;
				await byEmail.save();
				return byEmail;
			}
		}
		const name = [profile.name?.givenName, profile.name?.familyName].filter(Boolean).join(' ') || profile.displayName || 'User';
		const role = await Role.ensureDefaultUserRole();
		const placeholderPassword = crypto.randomBytes(32).toString('hex');
		return this.create({
			name,
			email: email || `${googleId}@google.oauth`,
			password: placeholderPassword,
			googleId,
			confirmed: true,
			roles: [role._id],
			avatar: profile.photos?.[0]?.value ? undefined : 'avatar.png'
		}) as unknown as Promise<IUserDocument>;
	}

	static async createUser(this: IUserModel, body: Partial<IUser>): Promise<IUserDocument> {
		if (!body.password) {
			throw new ValidationError('Password is required');
		}
		if (await this.isEmailAlreadyExists(body.email!)) {
			throw new ConflictError('Email already exists');
		}
		if (body.roles) {
			await Promise.all(
				body.roles.map(async (rid) => {
					if (!(await Role.findById(rid))) {
						throw new ValidationError('Roles not exist');
					}
				})
			);
		}
		return this.create(body) as unknown as Promise<IUserDocument>;
	}

	static async updateUserById(this: IUserModel, userId: Types.ObjectId | string, body: Partial<IUser>): Promise<IUserDocument> {
		const user = await this.getUserById(userId);
		if (!user) {
			throw new NotFoundError('User not found');
		}
		if (body.email && (await this.isEmailAlreadyExists(body.email, userId))) {
			throw new ConflictError('Email already exists');
		}
		if (body.roles) {
			await Promise.all(
				body.roles.map(async (rid) => {
					if (!(await Role.findById(rid))) {
						throw new ValidationError('Roles not exist');
					}
				})
			);
		}
		Object.assign(user, body);
		return user.save() as unknown as Promise<IUserDocument>;
	}

	static async deleteUserById(this: IUserModel, userId: Types.ObjectId | string): Promise<IUserDocument | null> {
		const user = await this.getUserById(userId);
		if (!user) {
			throw new NotFoundError('User not found');
		}
		await user.deleteOne();
		return user;
	}

	async isPasswordMatch(this: IUserDocument, password: string): Promise<boolean> {
		if (!this.password) return false;
		return bcrypt.compareSync(password, this.password);
	}
}

userSchema.loadClass(UserClass);

userSchema.pre('save', async function (next) {
	if (this.isModified('password') && this.password) {
		const passwordGenSalt = bcrypt.genSaltSync(10);
		this.password = bcrypt.hashSync(this.password, passwordGenSalt);
	}
	next();
});

const User = mongoose.model<IUser, IUserModel>('users', userSchema);

export default User;

import mongoose, { Types } from 'mongoose';
import config from '~/config/config';
import { NotFoundError } from '~/utils/domainErrors';
import toJSON from './plugins/toJSONPlugin';

export interface IToken {
	user: Types.ObjectId;
	token: string;
	type: string;
	blacklisted?: boolean;
	expiresAt: Date;
	createdAt?: Date;
	updatedAt?: Date;
}

interface ITokenModel extends mongoose.Model<IToken> {
	saveToken(
		token: string,
		userId: Types.ObjectId,
		expires: Date,
		type: string,
		blacklisted?: boolean
	): Promise<mongoose.HydratedDocument<IToken>>;
	revokeToken(token: string, type: string): Promise<void>;
}

const tokenSchema = new mongoose.Schema<IToken>(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'users',
			required: true
		},
		token: {
			type: String,
			required: true,
			index: true
		},
		type: {
			type: String,
			enum: [config.TOKEN_TYPES.REFRESH, config.TOKEN_TYPES.RESET_PASSWORD, config.TOKEN_TYPES.VERIFY_EMAIL],
			required: true
		},
		blacklisted: {
			type: Boolean,
			default: false
		},
		expiresAt: {
			type: Date,
			required: true
		}
	},
	{
		timestamps: true
	}
);

// Compound index for revoke/verify lookups
tokenSchema.index({ token: 1, type: 1 });
// TTL: auto-delete expired tokens
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

tokenSchema.plugin(toJSON);

class TokenClass {
	static async saveToken(
		this: ITokenModel,
		token: string,
		userId: Types.ObjectId,
		expires: Date,
		type: string,
		blacklisted = false
	): Promise<mongoose.HydratedDocument<IToken>> {
		return this.create({
			user: userId,
			token,
			type,
			expiresAt: expires,
			blacklisted
		});
	}

	static async revokeToken(this: ITokenModel, token: string, type: string): Promise<void> {
		const tokenDoc = await this.findOne({
			token,
			type,
			blacklisted: false
		});
		if (!tokenDoc) {
			throw new NotFoundError('Token not found');
		}
		await tokenDoc.deleteOne();
	}
}

tokenSchema.loadClass(TokenClass);

const Token = mongoose.model<IToken, ITokenModel>('tokens', tokenSchema);

export default Token;

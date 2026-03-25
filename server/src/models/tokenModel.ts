import mongoose, { Types } from 'mongoose';
import moment from 'moment';
import config from '~/config/config';
import { NotFoundError } from '~/utils/domainErrors';
import toJSON from './plugins/toJSONPlugin';

export interface IToken {
	user: Types.ObjectId;
	token: string;
	type: string;
	blacklisted?: boolean;
	/** Refresh tokens only: rotation / reuse detection */
	consumed?: boolean;
	familyId?: string;
	expiresAt: Date;
	createdAt?: Date;
	updatedAt?: Date;
}

export type RefreshRotationResult =
	| { outcome: 'rotated'; userId: Types.ObjectId; familyId: string | undefined }
	| { outcome: 'invalid' }
	| { outcome: 'reuse' };

interface ITokenModel extends mongoose.Model<IToken> {
	saveToken(
		token: string,
		userId: Types.ObjectId,
		expires: Date,
		type: string,
		options?: { blacklisted?: boolean; familyId?: string }
	): Promise<mongoose.HydratedDocument<IToken>>;
	revokeToken(token: string, type: string): Promise<void>;
	consumeRefreshTokenForRotation(token: string): Promise<RefreshRotationResult>;
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
		consumed: {
			type: Boolean,
			default: false
		},
		familyId: {
			type: String,
			index: true
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
		options?: { blacklisted?: boolean; familyId?: string }
	): Promise<mongoose.HydratedDocument<IToken>> {
		const blacklisted = options?.blacklisted ?? false;
		const familyId = options?.familyId;
		return this.create({
			user: userId,
			token,
			type,
			expiresAt: expires,
			blacklisted,
			...(familyId !== undefined && { familyId })
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

	/**
	 * Atomically marks a valid refresh token consumed and returns rotation context.
	 * If an already-consumed refresh is presented, revokes the whole family (reuse detection).
	 */
	static async consumeRefreshTokenForRotation(this: ITokenModel, token: string): Promise<RefreshRotationResult> {
		const now = new Date();
		const doc = await this.findOneAndUpdate(
			{
				token,
				type: config.TOKEN_TYPES.REFRESH,
				blacklisted: false,
				consumed: false,
				expiresAt: { $gt: now }
			},
			{ $set: { consumed: true } },
			{ new: false }
		);

		if (doc) {
			return { outcome: 'rotated', userId: doc.user, familyId: doc.familyId };
		}

		const existing = await this.findOne({ token, type: config.TOKEN_TYPES.REFRESH });
		if (!existing) {
			return { outcome: 'invalid' };
		}
		if (moment(existing.expiresAt).isBefore(moment())) {
			return { outcome: 'invalid' };
		}
		if (existing.consumed) {
			if (existing.familyId) {
				await this.deleteMany({
					user: existing.user,
					type: config.TOKEN_TYPES.REFRESH,
					familyId: existing.familyId
				});
			} else {
				await this.deleteMany({ user: existing.user, type: config.TOKEN_TYPES.REFRESH });
			}
			return { outcome: 'reuse' };
		}
		return { outcome: 'invalid' };
	}
}

tokenSchema.loadClass(TokenClass);

const Token = mongoose.model<IToken, ITokenModel>('tokens', tokenSchema);

export default Token;

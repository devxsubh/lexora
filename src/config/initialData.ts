import bcrypt from 'bcryptjs';
import Permission from '~/models/permissionModel';
import Role from '~/models/roleModel';
import User from '~/models/userModel';
import config from './config';
import logger from './logger';

function hashPassword(plain: string): string {
	return bcrypt.hashSync(plain, bcrypt.genSaltSync(10));
}

async function initialData(): Promise<void> {
	try {
		const countPermissions = await Permission.estimatedDocumentCount();
		if (countPermissions === 0) {
			await Permission.insertMany([
				{ controller: 'user', action: 'create' },
				{ controller: 'user', action: 'read' },
				{ controller: 'user', action: 'update' },
				{ controller: 'user', action: 'delete' },
				{ controller: 'role', action: 'create' },
				{ controller: 'role', action: 'read' },
				{ controller: 'role', action: 'update' },
				{ controller: 'role', action: 'delete' },
				{ controller: 'image', action: 'create' }
			]);
		}
		const countRoles = await Role.estimatedDocumentCount();
		if (countRoles === 0) {
			const permissionsSuperAdministrator = await Permission.find();
			const permissionsAdministrator = await Permission.find({ controller: 'user' });
			const permissionsModerator = await Permission.find({
				controller: 'user',
				action: { $ne: 'delete' }
			});
			await Role.insertMany([
				{
					name: 'Super Administrator',
					permissions: permissionsSuperAdministrator.map((p) => p._id)
				},
				{
					name: 'Administrator',
					permissions: permissionsAdministrator.map((p) => p._id)
				},
				{
					name: 'Moderator',
					permissions: permissionsModerator.map((p) => p._id)
				},
				{ name: 'User', permissions: [] }
			]);
		}
		// Seed users only in development/test when explicitly enabled; never in production
		if (config.NODE_ENV === 'production') {
			return;
		}
		const countUsers = await User.estimatedDocumentCount();
		if (countUsers === 0) {
			const roleSuperAdministrator = await Role.findOne({ name: 'Super Administrator' });
			const roleAdministrator = await Role.findOne({ name: 'Administrator' });
			const roleModerator = await Role.findOne({ name: 'Moderator' });
			const roleUser = await Role.findOne({ name: 'User' });
			if (!roleSuperAdministrator || !roleAdministrator || !roleModerator || !roleUser) {
				logger.warn('Initial data: one or more roles not found');
				return;
			}
			// Use SEED_DEFAULT_PASSWORD when set (e.g. CI/test) for safer seeds; otherwise default dev passwords
			const defaultPassword =
				config.SEED_DEFAULT_PASSWORD && config.SEED_DEFAULT_PASSWORD.length >= 6 ? config.SEED_DEFAULT_PASSWORD : undefined;
			if (!defaultPassword) {
				logger.warn('Initial data: using default dev passwords. Set SEED_DEFAULT_PASSWORD (min 6 chars) for safer seeds.');
			}
			const p1 = defaultPassword ?? 'superadmin';
			const p2 = defaultPassword ?? 'admin';
			const p3 = defaultPassword ?? 'moderator';
			const p4 = defaultPassword ?? 'user';
			// insertMany does not run pre('save'), so hash passwords before insert
			await User.insertMany([
				{
					name: 'Thuc Nguyen',
					email: 'admjnwapviip@gmail.com',
					password: hashPassword(p1),
					roles: [roleSuperAdministrator._id, roleAdministrator._id, roleModerator._id, roleUser._id]
				},
				{
					name: 'Vy Nguyen',
					email: 'admin@example.com',
					password: hashPassword(p2),
					roles: [roleAdministrator._id]
				},
				{
					name: 'Thuyen Nguyen',
					email: 'moderator@example.com',
					password: hashPassword(p3),
					roles: [roleModerator._id]
				},
				{
					name: 'Uyen Nguyen',
					email: 'user@example.com',
					password: hashPassword(p4),
					roles: [roleUser._id]
				}
			]);
		}
	} catch (err) {
		logger.error(err);
	}
}

export default initialData;

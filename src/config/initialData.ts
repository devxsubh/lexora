import bcrypt from 'bcryptjs';
import Permission from '~/models/permissionModel';
import Role from '~/models/roleModel';
import User from '~/models/userModel';
import Template from '~/models/templateModel';
import Clause from '~/models/clauseModel';
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
		const countTemplates = await Template.estimatedDocumentCount();
		if (countTemplates === 0) {
			await Template.insertMany([
				{
					name: 'nda',
					label: 'Mutual NDA',
					description: 'Standard mutual non-disclosure agreement for evaluations and discussions.',
					category: 'Confidentiality',
					content: [
						{ id: 't1', type: 'heading', props: { level: 1 }, content: [{ type: 'text', text: 'Mutual Non-Disclosure Agreement', styles: {} }] },
						{ id: 't2', type: 'paragraph', props: {}, content: [{ type: 'text', text: 'This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of {{Effective Date}} by and between {{Party A Name}} ("Party A") and {{Party B Name}} ("Party B").', styles: {} }] },
						{ id: 't3', type: 'heading', props: { level: 2 }, content: [{ type: 'text', text: '1. Definition of Confidential Information', styles: {} }] },
						{ id: 't4', type: 'paragraph', props: {}, content: [{ type: 'text', text: '"Confidential Information" means any non-public information disclosed by either party to the other party, whether orally, in writing, or by inspection of tangible objects.', styles: {} }] },
						{ id: 't5', type: 'heading', props: { level: 2 }, content: [{ type: 'text', text: '2. Obligations of Receiving Party', styles: {} }] },
						{ id: 't6', type: 'paragraph', props: {}, content: [{ type: 'text', text: 'The Receiving Party shall hold and maintain the Confidential Information in strict confidence and shall not disclose, publish, or otherwise reveal any of the Confidential Information to any third party.', styles: {} }] },
						{ id: 't7', type: 'heading', props: { level: 2 }, content: [{ type: 'text', text: '3. Term', styles: {} }] },
						{ id: 't8', type: 'paragraph', props: {}, content: [{ type: 'text', text: 'This Agreement shall remain in effect for a period of three (3) years from the Effective Date.', styles: {} }] }
					]
				},
				{
					name: 'vendor-agreement',
					label: 'Vendor Agreement',
					description: 'Master vendor agreement for supply of components or services.',
					category: 'Commercial',
					content: [
						{ id: 'v1', type: 'heading', props: { level: 1 }, content: [{ type: 'text', text: 'Vendor Agreement', styles: {} }] },
						{ id: 'v2', type: 'paragraph', props: {}, content: [{ type: 'text', text: 'This Vendor Agreement ("Agreement") is entered into as of {{Effective Date}} by and between {{Company Name}} ("Company") and {{Vendor Name}} ("Vendor").', styles: {} }] },
						{ id: 'v3', type: 'heading', props: { level: 2 }, content: [{ type: 'text', text: '1. Scope of Services', styles: {} }] },
						{ id: 'v4', type: 'paragraph', props: {}, content: [{ type: 'text', text: 'Vendor agrees to provide the services described in Exhibit A attached hereto.', styles: {} }] }
					]
				},
				{
					name: 'consulting-agreement',
					label: 'Consulting Agreement',
					description: 'Engagement terms for independent consultants or agencies.',
					category: 'Services',
					content: [
						{ id: 'c1', type: 'heading', props: { level: 1 }, content: [{ type: 'text', text: 'Consulting Agreement', styles: {} }] },
						{ id: 'c2', type: 'paragraph', props: {}, content: [{ type: 'text', text: 'This Consulting Agreement ("Agreement") is entered into as of {{Effective Date}} by and between {{Client Name}} ("Client") and {{Consultant Name}} ("Consultant").', styles: {} }] }
					]
				},
				{
					name: 'employment-offer',
					label: 'Employment Offer',
					description: 'Offer letter template for full-time roles.',
					category: 'Employment',
					content: [
						{ id: 'e1', type: 'heading', props: { level: 1 }, content: [{ type: 'text', text: 'Employment Offer Letter', styles: {} }] },
						{ id: 'e2', type: 'paragraph', props: {}, content: [{ type: 'text', text: 'Dear {{Candidate Name}},', styles: {} }] },
						{ id: 'e3', type: 'paragraph', props: {}, content: [{ type: 'text', text: 'We are pleased to offer you the position of {{Job Title}} at {{Company Name}}, effective {{Start Date}}.', styles: {} }] }
					]
				},
				{
					name: 'msa-logistics',
					label: 'MSA – Logistics Partner',
					description: 'Master service agreement for logistics and fulfillment partners.',
					category: 'Commercial',
					content: [
						{ id: 'm1', type: 'heading', props: { level: 1 }, content: [{ type: 'text', text: 'Master Service Agreement – Logistics', styles: {} }] },
						{ id: 'm2', type: 'paragraph', props: {}, content: [{ type: 'text', text: 'This Master Service Agreement ("Agreement") is entered into as of {{Effective Date}} by and between {{Company Name}} ("Company") and {{Logistics Partner}} ("Partner").', styles: {} }] }
					]
				}
			]);
			logger.info('Seeded default contract templates');
		}

		const countClauses = await Clause.estimatedDocumentCount();
		if (countClauses === 0) {
			await Clause.insertMany([
				{
					title: 'Confidentiality',
					content: 'Both parties agree to maintain the confidentiality of all proprietary information shared under this Agreement for a period of three (3) years after termination.',
					category: 'Confidentiality',
					tags: ['nda', 'mutual'],
					usageCount: 24
				},
				{
					title: 'Limitation of Liability',
					content: "Except as required by law, each party's aggregate liability shall be limited to the fees paid under this Agreement in the twelve (12) months preceding the claim.",
					category: 'Liability',
					tags: ['cap', 'commercial'],
					usageCount: 17
				},
				{
					title: 'Termination for Convenience',
					content: 'Either party may terminate this Agreement for convenience upon thirty (30) days\' prior written notice to the other party.',
					category: 'Termination',
					tags: ['termination'],
					usageCount: 9
				},
				{
					title: 'Governing Law (India)',
					content: 'This Agreement shall be governed by and construed in accordance with the laws of India and the courts at New Delhi shall have exclusive jurisdiction.',
					category: 'Governing Law',
					tags: ['india', 'jurisdiction'],
					usageCount: 11
				},
				{
					title: 'Dispute Resolution – Arbitration',
					content: 'Any dispute arising out of or in connection with this Agreement shall be finally settled by binding arbitration in accordance with the rules of the chosen arbitration institution.',
					category: 'Dispute Resolution',
					tags: ['arbitration'],
					usageCount: 14
				}
			]);
			logger.info('Seeded default clause library');
		}
	} catch (err) {
		logger.error(err);
	}
}

export default initialData;

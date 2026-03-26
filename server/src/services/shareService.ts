import Contract from '~/models/contractModel';
import ContractShare, { ShareRole } from '~/models/contractShareModel';
import User from '~/models/userModel';
import { NotFoundError, ValidationError } from '~/utils/domainErrors';

async function assertContractOwner(contractId: string, ownerId: string) {
	const contract = await Contract.findOne({ _id: contractId, userId: ownerId });
	if (!contract) throw new NotFoundError('Contract not found');
	return contract;
}

function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

export async function listShares(contractId: string, ownerId: string) {
	const contract = await assertContractOwner(contractId, ownerId);
	const shares = await ContractShare.find({ contractId: contract._id }).sort({ createdAt: -1 });
	return {
		generalAccess: (contract as any).shareGeneralAccess || 'restricted',
		shares
	};
}

export async function addShare(contractId: string, ownerId: string, email: string, role: ShareRole) {
	if (!email) throw new ValidationError('Email is required');
	const contract = await assertContractOwner(contractId, ownerId);

	const normalized = normalizeEmail(email);
	const existingUser = await User.findOne({ email: normalized });
	if (existingUser && existingUser._id.toString() === ownerId) {
		throw new ValidationError('Owner already has access');
	}

	const upsert = await ContractShare.findOneAndUpdate(
		{ contractId: contract._id, email: normalized },
		{
			$set: {
				role,
				userId: existingUser?._id,
				addedBy: ownerId
			}
		},
		{ new: true, upsert: true, setDefaultsOnInsert: true }
	);

	return upsert;
}

export async function updateShareRole(contractId: string, ownerId: string, shareId: string, role: ShareRole) {
	await assertContractOwner(contractId, ownerId);
	const share = await ContractShare.findOne({ _id: shareId, contractId });
	if (!share) throw new NotFoundError('Collaborator not found');
	share.role = role;
	await share.save();
	return share;
}

export async function deleteShare(contractId: string, ownerId: string, shareId: string) {
	await assertContractOwner(contractId, ownerId);
	const share = await ContractShare.findOne({ _id: shareId, contractId });
	if (!share) throw new NotFoundError('Collaborator not found');
	await share.deleteOne();
}

export async function updateContractGeneralAccess(
	contractId: string,
	ownerId: string,
	generalAccess: 'restricted' | 'anyone-with-link'
) {
	const contract = await assertContractOwner(contractId, ownerId);
	(contract as any).shareGeneralAccess = generalAccess;
	await contract.save();
	return { generalAccess: (contract as any).shareGeneralAccess };
}

export default {
	listShares,
	addShare,
	updateShareRole,
	deleteShare,
	updateContractGeneralAccess
};

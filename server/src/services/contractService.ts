import Contract, { IContract, IContractDocument } from '~/models/contractModel';
import Activity from '~/models/activityModel';
import { NotFoundError } from '~/utils/domainErrors';
import escapeRegex from '~/utils/escapeRegex';

export interface ListContractsOptions {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortDirection?: string;
}

export async function listContracts(userId: string, options: ListContractsOptions) {
	const result = await Contract.paginate(
		options as Record<string, unknown>,
		undefined,
		{ userId }
	);
	return {
		contracts: result.results,
		total: result.totalResults,
		page: Number(options.page) || 1,
		limit: Number(options.limit) || 10
	};
}

export async function getContract(id: string, userId: string): Promise<IContractDocument> {
	const contract = await Contract.findOne({ _id: id, userId });
	if (!contract) throw new NotFoundError('Contract not found');
	return contract;
}

export async function createContract(userId: string, body: Partial<IContract>): Promise<IContractDocument> {
	const contract = await Contract.create({ ...body, userId });

	await Activity.create({
		userId,
		contractId: contract._id,
		text: `Created contract "${contract.title}"`,
		type: 'create'
	});

	return contract;
}

export async function updateContract(id: string, userId: string, body: Partial<IContract>): Promise<IContractDocument> {
	const contract = await Contract.findOne({ _id: id, userId });
	if (!contract) throw new NotFoundError('Contract not found');

	Object.assign(contract, body);
	await contract.save();

	await Activity.create({
		userId,
		contractId: contract._id,
		text: `Edited contract "${contract.title}"`,
		type: 'edit'
	});

	return contract;
}

export async function autosaveContract(
	id: string,
	userId: string,
	content: Record<string, unknown>[],
	lastModified?: string
): Promise<IContractDocument> {
	const contract = await Contract.findOne({ _id: id, userId });
	if (!contract) throw new NotFoundError('Contract not found');

	contract.content = content as unknown as IContract['content'];
	if (lastModified) {
		contract.updatedAt = new Date(lastModified);
	}
	await contract.save();
	return contract;
}

export async function deleteContract(id: string, userId: string): Promise<void> {
	const contract = await Contract.findOne({ _id: id, userId });
	if (!contract) throw new NotFoundError('Contract not found');
	await contract.deleteOne();
}

export async function favoriteContract(id: string, userId: string): Promise<IContractDocument> {
	const contract = await Contract.findOne({ _id: id, userId });
	if (!contract) throw new NotFoundError('Contract not found');
	contract.isFavorite = true;
	await contract.save();
	return contract;
}

export async function unfavoriteContract(id: string, userId: string): Promise<IContractDocument> {
	const contract = await Contract.findOne({ _id: id, userId });
	if (!contract) throw new NotFoundError('Contract not found');
	contract.isFavorite = false;
	await contract.save();
	return contract;
}

export default {
	listContracts,
	getContract,
	createContract,
	updateContract,
	autosaveContract,
	deleteContract,
	favoriteContract,
	unfavoriteContract
};

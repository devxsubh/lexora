import SignatureRequest, { ISignatureRequestDocument } from '~/models/signatureRequestModel';
import Contract from '~/models/contractModel';
import Activity from '~/models/activityModel';
import { NotFoundError, ValidationError } from '~/utils/domainErrors';

interface SignerInput {
	email: string;
	name: string;
	roleId?: string;
	roleName?: string;
}

export async function requestSignatures(
	contractId: string,
	userId: string,
	signers: SignerInput[],
	message?: string
): Promise<ISignatureRequestDocument> {
	const contract = await Contract.findOne({ _id: contractId, userId });
	if (!contract) throw new NotFoundError('Contract not found');

	const request = await SignatureRequest.create({
		contractId,
		userId,
		status: 'pending',
		message,
		signers: signers.map((s) => ({
			email: s.email,
			name: s.name,
			roleId: s.roleId,
			roleName: s.roleName,
			status: 'pending'
		}))
	});

	await Activity.create({
		userId,
		contractId: contract._id,
		text: `Sent "${contract.title}" for signature to ${signers.map((s) => s.name).join(', ')}`,
		type: 'signature'
	});

	return request;
}

export async function listSignatures(contractId: string, userId: string): Promise<ISignatureRequestDocument[]> {
	return SignatureRequest.find({ contractId, userId }).sort({ createdAt: -1 });
}

export async function signDocument(
	contractId: string,
	signatureData: string,
	signerName: string,
	requestId?: string
) {
	const query: Record<string, unknown> = { contractId, status: 'pending' };
	if (requestId) query._id = requestId;

	const request = await SignatureRequest.findOne(query);
	if (!request) throw new NotFoundError('Signature request not found');

	const signer = request.signers.find(
		(s) => s.name.toLowerCase() === signerName.toLowerCase() && s.status === 'pending'
	);
	if (!signer) throw new ValidationError('Signer not found or already signed');

	signer.status = 'signed';
	signer.signedAt = new Date();
	signer.signatureData = signatureData;

	const allSigned = request.signers.every((s) => s.status === 'signed');
	if (allSigned) {
		request.status = 'completed';
	}

	await request.save();

	await Activity.create({
		userId: request.userId,
		contractId: request.contractId,
		text: `${signerName} signed the document`,
		type: 'signature'
	});

	return request;
}

export default { requestSignatures, listSignatures, signDocument };

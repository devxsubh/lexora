import Template, { ITemplateDocument } from '~/models/templateModel';
import Contract, { IContractDocument } from '~/models/contractModel';
import { NotFoundError } from '~/utils/domainErrors';

export async function listTemplates(category?: string): Promise<ITemplateDocument[]> {
	const query: Record<string, unknown> = {};
	if (category) query.category = category;
	return Template.find(query).sort({ createdAt: -1 });
}

export async function createContractFromTemplate(
	userId: string,
	templateId: string,
	titleOverride?: string
): Promise<IContractDocument> {
	const template = await Template.findOne({
		$or: [{ _id: templateId.match(/^[0-9a-fA-F]{24}$/) ? templateId : undefined }, { name: templateId }]
	});
	if (!template) throw new NotFoundError('Template not found');

	const contract = await Contract.create({
		title: titleOverride || template.label,
		content: template.content || [],
		status: 'draft',
		userId,
		contractType: template.category
	});

	return contract;
}

export default { listTemplates, createContractFromTemplate };

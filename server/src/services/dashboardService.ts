import Contract from '~/models/contractModel';
import SignatureRequest from '~/models/signatureRequestModel';
import Activity from '~/models/activityModel';
import moment from 'moment';

export async function getMetrics(userId: string) {
	const [totalContracts, pendingSignatures, expiringSoon, aiRiskFlags] = await Promise.all([
		Contract.countDocuments({ userId }),
		SignatureRequest.countDocuments({ userId, status: 'pending' }),
		Contract.countDocuments({
			userId,
			effectiveDate: {
				$gte: new Date(),
				$lte: moment().add(30, 'days').toDate()
			}
		}),
		Contract.countDocuments({ userId, aiRiskScore: { $gte: 70 } })
	]);

	return { totalContracts, pendingSignatures, expiringSoon, aiRiskFlags };
}

export async function getDashboardContracts(userId: string, options: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }) {
	const page = options.page || 1;
	const limit = options.limit || 10;
	const skip = (page - 1) * limit;
	const sortBy = options.sortBy || 'updatedAt';
	const sortOrder = options.sortOrder === 'asc' ? 1 : -1;

	const [contracts, total] = await Promise.all([
		Contract.find({ userId })
			.sort({ [sortBy]: sortOrder })
			.skip(skip)
			.limit(limit),
		Contract.countDocuments({ userId })
	]);

	const formatted = contracts.map((c) => ({
		id: c.id,
		name: c.title,
		party: c.party || '',
		contractType: c.contractType || '',
		status: c.status,
		aiRiskScore: c.aiRiskScore ?? 0,
		lastUpdated: c.updatedAt?.toISOString() || '',
		lastActivity: '',
		riskLevel: c.riskLevel || 'Low',
		hasRiskFlag: (c.aiRiskScore ?? 0) >= 70,
		lifecycleStage: c.lifecycleStage ?? 0,
		effectiveDate: c.effectiveDate?.toISOString() || null,
		summary: c.summary || ''
	}));

	return { contracts: formatted, total, page, limit };
}

export async function getRecentActivity(userId: string, limit: number = 10) {
	const activities = await Activity.find({ userId })
		.sort({ createdAt: -1 })
		.limit(limit);

	return activities.map((a) => ({
		id: a.id,
		text: a.text,
		time: moment(a.createdAt).fromNow(),
		contractId: a.contractId?.toString() || null,
		type: a.type
	}));
}

export async function getAiInsights(userId: string) {
	const riskyContracts = await Contract.find({
		userId,
		$or: [
			{ aiRiskScore: { $gte: 50 } },
			{
				effectiveDate: {
					$gte: new Date(),
					$lte: moment().add(14, 'days').toDate()
				}
			}
		]
	}).limit(5);

	return riskyContracts.map((c, idx) => {
		const isExpiring = c.effectiveDate && moment(c.effectiveDate).diff(moment(), 'days') <= 14;
		const isHighRisk = (c.aiRiskScore ?? 0) >= 70;

		if (isExpiring) {
			const daysLeft = moment(c.effectiveDate).diff(moment(), 'days');
			return {
				id: idx + 1,
				title: `Contract "${c.title}" expires in ${daysLeft} days`,
				fix: 'Prepare renewal draft and notify counterparty.',
				action: 'send-renewal',
				actionLabel: 'Send renewal draft',
				href: `/contracts/${c.id}`,
				contractId: c.id
			};
		}

		return {
			id: idx + 1,
			title: `"${c.title}" has elevated risk score (${c.aiRiskScore})`,
			fix: 'Review flagged clauses and align with standard templates.',
			action: 'compare-clause',
			actionLabel: 'Review contract',
			href: `/contracts/${c.id}`,
			contractId: c.id
		};
	});
}

export async function getMetricItems(userId: string, metricId: string) {
	switch (metricId) {
		case 'total-contracts': {
			const contracts = await Contract.find({ userId }).select('title party contractType status updatedAt').limit(20);
			return contracts.map((c) => ({
				id: c.id,
				name: c.title,
				party: c.party || '',
				type: c.contractType || '',
				status: c.status
			}));
		}
		case 'pending-signatures': {
			const requests = await SignatureRequest.find({ userId, status: 'pending' }).limit(20);
			return requests.map((r) => ({
				id: r.id,
				contractId: r.contractId?.toString(),
				awaiting: r.signers.filter((s) => s.status === 'pending').map((s) => s.name).join(', '),
				total: r.signers.length,
				pending: r.signers.filter((s) => s.status === 'pending').length
			}));
		}
		case 'expiring-soon': {
			const contracts = await Contract.find({
				userId,
				effectiveDate: {
					$gte: new Date(),
					$lte: moment().add(30, 'days').toDate()
				}
			}).limit(20);
			return contracts.map((c) => ({
				id: c.id,
				name: c.title,
				expires: c.effectiveDate?.toISOString() || '',
				daysLeft: c.effectiveDate ? moment(c.effectiveDate).diff(moment(), 'days') : 0
			}));
		}
		case 'ai-risk-flags': {
			const contracts = await Contract.find({
				userId,
				aiRiskScore: { $gte: 70 }
			}).limit(20);
			return contracts.map((c) => ({
				id: c.id,
				name: c.title,
				severity: c.riskLevel || 'High',
				issue: `Risk score: ${c.aiRiskScore}`,
				score: c.aiRiskScore
			}));
		}
		default:
			return [];
	}
}

export default { getMetrics, getDashboardContracts, getRecentActivity, getAiInsights, getMetricItems };

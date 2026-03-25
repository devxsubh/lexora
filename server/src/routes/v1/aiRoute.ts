import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import aiValidation from '~/validations/aiValidation';
import aiController from '~/controllers/aiController';

const router = Router();

router.get('/ping', catchAsync(aiController.geminiPing));

router.post(
	'/chat/:contractId',
	authenticate(),
	validate(aiValidation.sendChatMessage),
	catchAsync(aiController.sendChatMessage)
);
router.post(
	'/review/:contractId',
	authenticate(),
	validate(aiValidation.reviewContract),
	catchAsync(aiController.reviewContract)
);

router.post(
	'/editor/rewrite',
	authenticate(),
	validate(aiValidation.rewriteSelection),
	catchAsync(aiController.rewriteSelection)
);
router.post('/editor/explain', authenticate(), validate(aiValidation.explainClause), catchAsync(aiController.explainClause));
router.post(
	'/editor/summarize',
	authenticate(),
	validate(aiValidation.summarizeContract),
	catchAsync(aiController.summarizeContract)
);
router.post(
	'/editor/generate-clause',
	authenticate(),
	validate(aiValidation.generateClause),
	catchAsync(aiController.generateClause)
);
router.post(
	'/editor/suggest-clauses',
	authenticate(),
	validate(aiValidation.suggestClauses),
	catchAsync(aiController.suggestClauses)
);

export default router;

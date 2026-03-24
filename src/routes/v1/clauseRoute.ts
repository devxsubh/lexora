import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import clauseValidation from '~/validations/clauseValidation';
import clauseController from '~/controllers/clauseController';

const router = Router();

router.get('/', authenticate(), validate(clauseValidation.listClauses), catchAsync(clauseController.listClauses));
router.post('/', authenticate(), validate(clauseValidation.createClause), catchAsync(clauseController.createClause));
router.get('/:id', authenticate(), validate(clauseValidation.getClause), catchAsync(clauseController.getClause));
router.patch('/:id', authenticate(), validate(clauseValidation.updateClause), catchAsync(clauseController.updateClause));
router.delete('/:id', authenticate(), validate(clauseValidation.deleteClause), catchAsync(clauseController.deleteClause));

export default router;

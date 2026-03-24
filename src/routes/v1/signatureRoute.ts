import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import signatureValidation from '~/validations/signatureValidation';
import signatureController from '~/controllers/signatureController';

const router = Router();

router.post('/:contractId/signatures/request', authenticate(), validate(signatureValidation.requestSignatures), catchAsync(signatureController.requestSignatures));
router.get('/:contractId/signatures', authenticate(), validate(signatureValidation.listSignatures), catchAsync(signatureController.listSignatures));
router.post('/:contractId/sign', authenticate(), validate(signatureValidation.signDocument), catchAsync(signatureController.signDocument));

export default router;

import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import templateValidation from '~/validations/templateValidation';
import templateController from '~/controllers/templateController';

const router = Router();

router.get('/', authenticate(), validate(templateValidation.listTemplates), catchAsync(templateController.listTemplates));

export default router;

import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import contractValidation from '~/validations/contractValidation';
import contractController from '~/controllers/contractController';
import templateValidation from '~/validations/templateValidation';
import templateController from '~/controllers/templateController';

const router = Router();

router.get('/', authenticate(), validate(contractValidation.listContracts), catchAsync(contractController.listContracts));
router.post('/', authenticate(), validate(contractValidation.createContract), catchAsync(contractController.createContract));
router.post('/generate', authenticate(), validate(contractValidation.generateContract), catchAsync(contractController.generateContract));
router.post('/from-template', authenticate(), validate(templateValidation.createFromTemplate), catchAsync(templateController.createFromTemplate));

router.get('/:id', authenticate(), validate(contractValidation.getContract), catchAsync(contractController.getContract));
router.put('/:id', authenticate(), validate(contractValidation.updateContract), catchAsync(contractController.updateContract));
router.delete('/:id', authenticate(), validate(contractValidation.deleteContract), catchAsync(contractController.deleteContract));

router.patch('/:id/autosave', authenticate(), validate(contractValidation.autosaveContract), catchAsync(contractController.autosaveContract));
router.get('/:id/download', authenticate(), validate(contractValidation.downloadContract), catchAsync(contractController.downloadContract));
router.patch('/:id/favorite', authenticate(), validate(contractValidation.favoriteContract), catchAsync(contractController.favoriteContract));
router.patch('/:id/unfavorite', authenticate(), validate(contractValidation.favoriteContract), catchAsync(contractController.unfavoriteContract));

export default router;

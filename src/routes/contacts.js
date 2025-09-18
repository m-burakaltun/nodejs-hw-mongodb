import { Router } from 'express';
import mongoose from 'mongoose';
import createError from 'http-errors';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  getAll, 
  getById, 
  createOne, 
  patchOne,
  removeOne,
} from '../controllers/contacts.js';

const router = Router();


router.param('contactId', (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, 'Invalid contact ID format'));
  }
  next();
});


router.get('/', ctrlWrapper(getAll));
router.get('/:contactId', ctrlWrapper(getById));

router.post('/', ctrlWrapper(createOne));


router.patch('/:contactId', ctrlWrapper(patchOne));


router.delete('/:contactId', ctrlWrapper(removeOne));

export default router;
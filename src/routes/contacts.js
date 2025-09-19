import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import {
  getAll,
  getById,
  createOne,
  patchOne,
  removeOne,
} from '../controllers/contacts.js';

import { isValidId } from '../middlewares/isValidId.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../validation/contactsSchemas.js';

const router = Router();

router.get('/', ctrlWrapper(getAll));

// ID ile getir
router.get('/:contactId', isValidId, ctrlWrapper(getById));

// Oluştur
router.post('/', validateBody(createContactSchema), ctrlWrapper(createOne));

// Güncelle (partial)
router.patch(
  '/:contactId',
  isValidId,
  validateBody(updateContactSchema),
  ctrlWrapper(patchOne)
);

// Sil
router.delete('/:contactId', isValidId, ctrlWrapper(removeOne));

export default router;
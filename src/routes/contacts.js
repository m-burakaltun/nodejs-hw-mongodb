import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/upload.js';

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
router.get('/_debug', (_req, res) => {
  res.json({ ok: true, where: 'auth router mounted' });
});
// Tüm contact rotalarını koruma altına al
router.use(authenticate);

router.get('/', ctrlWrapper(getAll));

// ID ile getir
router.get('/:contactId', isValidId, ctrlWrapper(getById));

// Oluştur
router.post(
  '/',
  upload.single('photo'),
  validateBody(createContactSchema),
  ctrlWrapper(createOne)
);

// Güncelle (partial)
router.patch(
  '/:contactId',
  isValidId,
  upload.single('photo'),
  validateBody(updateContactSchema),
  ctrlWrapper(patchOne)
);

// Sil
router.delete('/:contactId', isValidId, ctrlWrapper(removeOne));

export default router;

import createError from 'http-errors';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';

/** GET /contacts */
export const getAll = async (req, res) => {
  const list = await getContacts();
  res.json({ status: 200, message: 'OK', data: list });
};

/** GET /contacts/:contactId */
export const getById = async (req, res) => {
  const { contactId } = req.params;
  const doc = await getContactById(contactId);
  if (!doc) throw createError(404, 'Contact not found');
  res.json({ status: 200, message: 'OK', data: doc });
};

/** POST /contacts */
export const createOne = async (req, res) => {
  const { name, phoneNumber, email, isFavourite, contactType } = req.body;

  if (!name || !phoneNumber || !contactType) {
    throw createError(400, 'name, phoneNumber and contactType are required');
  }

  const created = await createContact({
    name,
    phoneNumber,
    email,
    isFavourite,
    contactType,
  });

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: created,
  });
};

/** PATCH /contacts/:contactId */
export const patchOne = async (req, res) => {
  const { contactId } = req.params;

  const updated = await updateContact(contactId, req.body);
  if (!updated) throw createError(404, 'Contact not found');

  res.json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updated,
  });
};

/** DELETE /contacts/:contactId */
export const removeOne = async (req, res) => {
  const { contactId } = req.params;
  const deleted = await deleteContact(contactId);
  if (!deleted) throw createError(404, 'Contact not found');
  res.status(204).send();
};
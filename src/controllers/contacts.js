import createError from 'http-errors';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';
import cloudinary from '../services/cloudinary.js';

export const getAll = async (req, res) => {
  const {
    page = '1',
    perPage = '10',
    sortBy = 'name',
    sortOrder = 'asc',
    type,
    isFavourite,
  } = req.query;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const perPageNum = Math.max(parseInt(perPage, 10) || 10, 1);

  const allowedSortFields = [
    'name',
    'email',
    'phoneNumber',
    'createdAt',
    'updatedAt',
  ];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
  const sortDirection = sortOrder === 'desc' ? -1 : 1;

  // Filtreleri hazırla
  const filter = { userId: req.user._id };
  if (type) filter.contactType = type;
  if (typeof isFavourite !== 'undefined') {
    filter.isFavourite = String(isFavourite).toLowerCase() === 'true';
  }

  // Skip & Limit
  const skip = (pageNum - 1) * perPageNum;
  const limit = perPageNum;
  const [items, totalItems] = await Promise.all([
    getContacts(filter, { skip, limit, sort: { [sortField]: sortDirection } }),
    getContacts(filter, { countOnly: true }),
  ]);

  const totalPages = Math.max(Math.ceil((totalItems || 0) / perPageNum), 1);

  return res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: {
      data: items,
      page: pageNum,
      perPage: perPageNum,
      totalItems: totalItems || 0,
      totalPages,
      hasPreviousPage: pageNum > 1,
      hasNextPage: pageNum < totalPages,
    },
  });
};

export const getById = async (req, res) => {
  const { contactId } = req.params;
  const doc = await getContactById(contactId, req.user._id);
  if (!doc) throw createError(404, 'Contact not found');
  res.json({ status: 200, message: 'OK', data: doc });
};

export const createOne = async (req, res) => {
  const { name, phoneNumber, email, isFavourite, contactType } = req.body;
  if (!name || !phoneNumber) {
    throw createError(400, 'name and phoneNumber are required');
  }

  let photoUrl;
  if (req.file) {
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'contacts' },
        (error, result) => {
          if (error) return reject(createError(500, 'Photo upload failed'));
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });
    photoUrl = uploadResult.secure_url;
  }

  const created = await createContact({
    name,
    phoneNumber,
    email,
    isFavourite,
    contactType,
    userId: req.user._id,
    photo: photoUrl,
  });

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: created,
  });
};


export const patchOne = async (req, res) => {
  const { contactId } = req.params;

  if (!Object.keys(req.body).length && !req.file) {
    throw createError(400, 'Missing fields for update');
  }

  let photoUrl;
  if (req.file) {
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'contacts' },
        (error, result) => {
          if (error) return reject(createError(500, 'Photo upload failed'));
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });
    photoUrl = uploadResult.secure_url;
  }

  const updateData = { ...req.body };
  if (photoUrl) updateData.photo = photoUrl;

  const updated = await updateContact(contactId, updateData, req.user._id);

  if (!updated) {
    throw createError(404, 'Contact not found');
  }

  return res.json({
    status: 200,
    message: 'Successfully updated the contact!',
    data: updated,
  });
};


export const removeOne = async (req, res) => {
  const { contactId } = req.params;
  const deleted = await deleteContact(contactId, req.user._id);
  if (!deleted) throw createError(404, 'Contact not found');

  return res.json({
    status: 200,
    message: 'Successfully deleted a contact!',
    data: { id: deleted._id },
  });
};
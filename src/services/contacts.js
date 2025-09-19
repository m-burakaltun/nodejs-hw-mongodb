import Contact from '../db/Contact.js';

export const getContacts = (filter = {}, options = {}) => {
  const { skip, limit, sort, countOnly = false } = options;

  if (countOnly) {
    return Contact.countDocuments(filter);
  }

  const query = Contact.find(filter);

  if (sort && typeof sort === 'object') {
    query.sort(sort);
  }

  if (Number.isInteger(skip) && skip >= 0) {
    query.skip(skip);
  }
  if (Number.isInteger(limit) && limit > 0) {
    query.limit(limit);
  }

  return query.exec();
};

export const getContactById = (id, userId) =>
  Contact.findOne({ _id: id, userId }); // 👈 sadece kendi contact

export const createContact = (payload) => Contact.create(payload);

export const updateContact = (id, payload, userId) =>
  Contact.findOneAndUpdate({ _id: id, userId }, payload, {
    new: true,
    runValidators: true,
  });

export const deleteContact = (id, userId) =>
  Contact.findOneAndDelete({ _id: id, userId });
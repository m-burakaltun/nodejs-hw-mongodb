import Contact from '../db/Contact.js';

export const getContacts = (filter = {}, options = {}) => {
  const { skip, limit, sort, countOnly = false } = options;

  if (countOnly) {
    // Sadece toplam kayıt sayısı
    return Contact.countDocuments(filter);
  }

  const query = Contact.find(filter);

  // Sıralama
  if (sort && typeof sort === 'object') {
    query.sort(sort);
  }

  // Sayfalandırma
  if (Number.isInteger(skip) && skip >= 0) {
    query.skip(skip);
  }
  if (Number.isInteger(limit) && limit > 0) {
    query.limit(limit);
  }

  return query.exec();
};

export const getContactById = (id) => Contact.findById(id);

export const createContact = (payload) => Contact.create(payload);

export const updateContact = (id, payload) =>
  Contact.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

export const deleteContact = (id) => Contact.findByIdAndDelete(id);
import Contact from '../db/Contact.js'; 

export const getContacts = (filter = {}) => Contact.find(filter);

export const getContactById = (id) => Contact.findById(id);

export const createContact = (payload) => Contact.create(payload);

export const updateContact = (id, payload) =>
  Contact.findByIdAndUpdate(id, payload, {
    new: true, 
    runValidators: true, 
  });

export const deleteContact = (id) => Contact.findByIdAndDelete(id);
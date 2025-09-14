import express from 'express';
import mongoose from 'mongoose';
import Contact from '../db/Contact.js';
import { getAllContacts, getContactById } from '../services/contacts.js';

const router = express.Router();

// Tüm kişileri getir
router.get('/', async (req, res) => {
  const contacts = await getAllContacts();
  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts',
    data: contacts,
  });
});

// ID'ye göre kişi getir
router.get('/:contactId', async (req, res) => {
  const { contactId } = req.params;

  // ✅ ObjectId geçerli mi kontrolü
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return res.status(400).json({ message: 'Invalid contact ID format' });
  }

  const contact = await getContactById(contactId);

  if (!contact) {
    return res.status(404).json({ message: 'Contact not found' });
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
});
router.post('/', async (req, res) => {
  try {
    const { name, phoneNumber, email, isFavourite, contactType } = req.body;

    if (!name || !phoneNumber) {
      return res
        .status(400)
        .json({ message: 'Name and phone number are required.' });
    }

    const newContact = await Contact.create({
      name,
      phoneNumber,
      email,
      isFavourite,
      contactType,
    });

    res.status(201).json({
      status: 201,
      message: 'Contact created successfully',
      data: newContact,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/:contactId', async (req, res) => {
  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return res.status(400).json({ message: 'Invalid contact ID format' });
  }

  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.status(200).json({
      status: 200,
      message: 'Contact updated successfully!',
      data: updatedContact,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating contact.' });
  }
});

router.delete('/:contactId', async (req, res) => {
  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return res.status(400).json({ message: 'Invalid contact ID format' });
  }

  try {
    const deletedContact = await Contact.findByIdAndDelete(contactId);

    if (!deletedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.status(200).json({
      status: 200,
      message: 'Contact deleted successfully!',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting contact.' });
  }
});

export default router;
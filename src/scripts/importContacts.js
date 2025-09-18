import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import Contact from '../db/Contact.js';

dotenv.config();

const __dirname = path.resolve();

const importContacts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const filePath = path.join(__dirname, 'contacts.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const contacts = JSON.parse(data);

    await Contact.insertMany(contacts);
    console.log('Contacts imported successfully!');
    process.exit();
  } catch (error) {
    console.error('Import failed:', error.message);
    process.exit(1);
  }
};

importContacts();
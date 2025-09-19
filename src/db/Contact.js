import mongoose, { Schema } from 'mongoose';

const contactSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    isFavourite: { type: Boolean, default: false },
    contactType: {
      type: String,
      enum: ['work', 'home', 'personal'],
      default: 'personal',
      required: true,
    },

    photo: { type: String },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const Contact = mongoose.model('Contact', contactSchema, 'contacts');
export default Contact;
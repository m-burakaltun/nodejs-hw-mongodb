import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 64,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // Hash’li saklanacak (register servisinde hashleyeceğiz)
      minlength: 6,
    },
  },
  { timestamps: true, versionKey: false }
);

// Email için index
userSchema.index({ email: 1 }, { unique: true });

export const User = model('User', userSchema, 'users');

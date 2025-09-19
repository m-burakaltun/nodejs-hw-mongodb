import { Schema, model, Types } from 'mongoose';

const sessionSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    accessTokenValidUntil: {
      type: Date,
      required: true,
      index: true,
    },
    refreshTokenValidUntil: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export const Session = model('Session', sessionSchema, 'sessions');
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Session } from '../models/Session.js';

// Kullanıcı kaydı
export const registerUser = async ({ name, email, password }) => {
  // Email zaten kayıtlı mı kontrol et
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createHttpError(409, 'Email in use');
  }

  // Şifre hashle
  const hashedPassword = await bcrypt.hash(password, 10);

  // Yeni kullanıcı oluştur
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // Şifreyi dönmeden önce çıkar
  const userObj = newUser.toObject();
  delete userObj.password;

  return userObj;
};

// Kullanıcı girişi
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(401, 'Email or password is wrong');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw createHttpError(401, 'Email or password is wrong');
  }

  // Eski session varsa sil
  await Session.deleteMany({ userId: user._id });

  // Access ve Refresh token oluştur
  const accessToken = jwt.sign(
    { id: user._id },
    process.env.JWT_ACCESS_SECRET, // 👈 değiştirildi
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );

  const now = new Date();
  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(now.getTime() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken };
};

// Session yenileme
export const refreshSession = async (refreshToken) => {
  if (!refreshToken) {
    throw createHttpError(401, 'No refresh token provided');
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw createHttpError(401, 'Invalid or expired refresh token');
  }

  // Eski session var mı kontrol et
  const existingSession = await Session.findOne({ refreshToken });
  if (!existingSession) {
    throw createHttpError(401, 'Session not found');
  }

  // Eski oturumu sil
  await Session.deleteOne({ _id: existingSession._id });

  // Yeni tokenlar
  const accessToken = jwt.sign(
    { id: payload.id },
    process.env.JWT_ACCESS_SECRET, // 👈 değiştirildi
    { expiresIn: '15m' }
  );
  const newRefreshToken = jwt.sign(
    { id: payload.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );

  const now = new Date();
  await Session.create({
    userId: payload.id,
    accessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil: new Date(now.getTime() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, newRefreshToken };
};

// Oturumu kapatma
export const logoutUser = async (refreshToken) => {
  if (!refreshToken) {
    throw createHttpError(401, 'No refresh token provided');
  }

  const session = await Session.findOne({ refreshToken });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  await Session.deleteOne({ _id: session._id });
};
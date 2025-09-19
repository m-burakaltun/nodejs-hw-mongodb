import * as authService from '../services/auth.js';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { User } from '../models/User.js';
import { sendMail } from '../services/email.js';


const pickRefreshToken = (req) => {
  // 1) cookie-parser ile gelen
  if (req.cookies?.refreshToken) return req.cookies.refreshToken;

  // 2) Header içindeki "Cookie: refreshToken=..." formatı
  const raw = req.headers?.cookie || '';
  const m = raw.match(/(?:^|;\s*)refreshToken=([^;]+)/);
  if (m) return decodeURIComponent(m[1]);

  // 3) Body ile gönderilmiş olabilir (test kolaylığı)
  if (req.body?.refreshToken) return req.body.refreshToken;

  return null;
};

// Kullanıcı kaydı
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const newUser = await authService.registerUser({ name, email, password });

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
    },
  });
};

// Kullanıcı girişi
export const login = async (req, res) => {
  const { email, password } = req.body;

  const { accessToken, refreshToken } = await authService.loginUser({
    email,
    password,
  });

  // Refresh token'ı cookie'ye ekle
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 gün
  });

  res.json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken,refreshToken },
  });
};

// Session yenileme
export const refresh = async (req, res) => {
  const refreshToken = pickRefreshToken(req);

  const { accessToken, newRefreshToken } =
    await authService.refreshSession(refreshToken);

  // Yeni refresh token'ı cookie'ye yaz
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken },
  });
};

// Kullanıcı çıkışı
export const logout = async (req, res) => {
  const refreshToken = pickRefreshToken(req);

  await authService.logoutUser(refreshToken);

  // Cookie'yi temizle
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(204).send(); // Gövde yok
};


// Şifre sıfırlama maili gönderme
export const sendResetEmail = async (req, res) => {
  const { email } = req.body;

  // Kullanıcı var mı?
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  // 5 dk geçerli token
  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '5m',
  });

  // Link
  const base = (process.env.APP_DOMAIN || '').replace(/\/$/, '');
  const resetUrl = `${base}/reset-password?token=${encodeURIComponent(token)}`;

  // Mail içeriği
  const subject = 'Reset your password';
  const text = `Hello ${user.name || ''},

We received a request to reset your password. This link expires in 5 minutes:
${resetUrl}

If you did not request this, ignore this email.`;

  const html = `
    <p>Hello ${user.name || ''},</p>
    <p>We received a request to reset your password. This link expires in <b>5 minutes</b>:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>If you did not request this, ignore this email.</p>
  `;

  try {
    await sendMail({ to: user.email, subject, text, html });
  } catch (err) {
    console.error('Email send error:', err?.message);
    throw createHttpError(500, 'Failed to send the email, please try again later.');
  }

  res.json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
};



// Şifre sıfırlama
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  // Token'dan email al
  const user = await User.findOne({ email: payload.email });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }


  const bcrypt = await import('bcrypt');
  const hashedPassword = await bcrypt.hash(password, 10);

  
  user.password = hashedPassword;
  await user.save();

  // Bu kullanıcıya ait tüm session'ları sil
  const { Session } = await import('../models/Session.js');
  await Session.deleteMany({ userId: user._id });

  res.json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
};
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';

export const authenticate = async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(createHttpError(401, 'No token provided'));
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    return next(createHttpError(401, 'Invalid token format'));
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET); // 👈 değişti
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(createHttpError(401, 'Access token expired'));
    }
    return next(createHttpError(401, 'Invalid token'));
  }

  // Token geçerli mi session'da var mı kontrol et
  const session = await Session.findOne({ accessToken: token });
  if (!session) {
    return next(createHttpError(401, 'Session not found'));
  }

  // Kullanıcıyı bul ve req.user'a ekle
  const user = await User.findById(payload.id);
  if (!user) {
    return next(createHttpError(401, 'User not found'));
  }

  req.user = user;
  next();
};
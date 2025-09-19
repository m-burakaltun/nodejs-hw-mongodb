import * as authService from '../services/auth.js';


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
export function getRefreshToken(req) {
  // 1) cookie-parser ile gelen
  if (req.cookies?.refreshToken) return req.cookies.refreshToken;

  // 2) Header içindeki "Cookie: refreshToken=..." formatı
  const cookieHeader = req.headers?.cookie || '';
  const match = cookieHeader.match(/(?:^|;\s*)refreshToken=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);

  // 3) Body ile gönderilmiş olabilir (test kolaylığı)
  if (req.body?.refreshToken) return req.body.refreshToken;

  return null;
}

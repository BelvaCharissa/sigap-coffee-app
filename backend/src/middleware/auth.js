const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sigap-secret-jwt-key-tst-pwam-2026';
const PARTNER_API_KEY = process.env.API_KEY || 'SIGAP-PARTNER-ACCESS-KEY-2026';

/**
 * Generate JWT token for authenticated app users
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      nim: user.nim || '',
      faskesTerkaitId: user.faskesTerkaitId || null,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Middleware: Verify user JWT token from Authorization header
 */
function verifyUserToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Token otentikasi tidak ditemukan. Harap sertakan header Authorization: Bearer <token>',
    });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Format header Authorization tidak valid. Gunakan format: Bearer <token>',
    });
  }

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token sesi kedaluwarsa atau tidak valid. Silakan login kembali.',
      error: err.message,
    });
  }
}

/**
 * Middleware: Optional user token (if provided, attach req.user)
 */
function optionalUserToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return next();

  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    try {
      req.user = jwt.verify(parts[1], JWT_SECRET);
    } catch (e) {
      // ignore optional auth errors
    }
  }
  next();
}

/**
 * Middleware: Verify API Key for Inter-Group Microservices (X-API-Key)
 */
function verifyApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak: Wajib menyertakan header X-API-Key untuk kelompok lain.',
    });
  }

  if (key !== PARTNER_API_KEY && key !== 'SIGAP-PWAM-PARTNER-KEY-2026' && key !== 'SIGAP-HEALTH-KEY-2026') {
    return res.status(403).json({
      success: false,
      message: 'X-API-Key tidak valid atau belum terdaftar di API Registry SIGAP.',
    });
  }

  req.callerGroup = 'partner-peer-group';
  next();
}

/**
 * Role-based guard
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: Operasi ini membutuhkan hak akses peran [${roles.join(', ')}].`,
      });
    }
    next();
  };
}

module.exports = {
  generateToken,
  verifyUserToken,
  optionalUserToken,
  verifyApiKey,
  requireRole,
  JWT_SECRET,
  PARTNER_API_KEY,
};

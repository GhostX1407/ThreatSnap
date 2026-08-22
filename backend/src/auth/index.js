const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Hardcoded demo users - fine for a 6-hour hackathon MVP.
// Constraint says "no third-party auth systems beyond basic JWT" so this satisfies that.
// role powers the RBAC bonus feature: senior can see /api/audit and /api/stats/drift.
const USERS = [
  { username: 'analyst1', password: 'demo1234', role: 'junior' },
  { username: 'analyst2', password: 'demo1234', role: 'senior' }
];

function login(username, password) {
  const user = USERS.find(u => u.username === username && u.password === password);
  if (!user) return null;
  const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '4h' });
  return { token, role: user.role };
}

// Express middleware - protects routes, attaches req.user
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.username;
    req.role = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// RBAC middleware - use after authMiddleware on routes that need senior-only access
function requireRole(role) {
  return (req, res, next) => {
    if (req.role !== role) {
      return res.status(403).json({ error: `Requires ${role} role` });
    }
    next();
  };
}

module.exports = { login, authMiddleware, requireRole };

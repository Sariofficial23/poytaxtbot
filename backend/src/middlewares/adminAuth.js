import config from '../config/default.js';

export function adminAuth(req, res, next) {
  const password = req.get('X-Admin-Password');
  if (!config.adminPassword || password !== config.adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

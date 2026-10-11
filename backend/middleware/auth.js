const admin = require('firebase-admin');
function createAuthMiddleware(verify = token => admin.auth().verifyIdToken(token)) {
  return async function requireAuth(req, res, next) {
    const token = req.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
    if (!token) return res.status(401).json({ error: 'Please sign in to continue.' });
    try {
      const user = await verify(token);
      if ((req.body?.userId && req.body.userId !== user.uid) || (req.query.userId && req.query.userId !== user.uid)) return res.status(403).json({ error: 'You cannot access another account.' });
      req.user = user;
      if (req.body && typeof req.body === 'object') req.body.userId = user.uid;
      next();
    } catch { return res.status(401).json({ error: 'Your session has expired. Please sign in again.' }); }
  };
}
module.exports = { requireAuth: createAuthMiddleware(), createAuthMiddleware };

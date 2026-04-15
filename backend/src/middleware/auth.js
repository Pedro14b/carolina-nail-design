const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Privilégios de admin necessários.' });
  }
  next();
};

const professionalMiddleware = (req, res, next) => {
  if (!['admin', 'professional'].includes(req.user?.role)) {
    return res.status(403).json({ error: 'Acesso negado. Privilégios de profissional necessários.' });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  professionalMiddleware
};

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    
    // Si no hay token, permitir continuar pero marcar como no autenticado
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      req.isAuthenticated = false;
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar la información del usuario al request
    req.user = decoded;
    req.isAuthenticated = true;
    
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    // En lugar de rechazar, permitir continuar pero marcar como no autenticado
    req.user = null;
    req.isAuthenticated = false;
    next();
  }
};

// Middleware más estricto para rutas que requieren autenticación obligatoria
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated || !req.user) {
    return res.status(401).json({ message: 'Autenticación requerida' });
  }
  next();
};

module.exports = { authMiddleware, requireAuth }; 
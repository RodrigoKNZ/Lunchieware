const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  console.log('🔐 Middleware de autenticación ejecutándose para:', req.method, req.path);
  console.log('📋 Headers:', req.headers);
  
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    console.log('🔑 Auth header:', authHeader);
    
    // Si no hay token, permitir continuar pero marcar como no autenticado
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No hay token válido, continuando sin autenticación');
      req.user = null;
      req.isAuthenticated = false;
      return next();
    }

    const token = authHeader.split(' ')[1];
    console.log('✅ Token encontrado, verificando...');
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token válido, usuario:', decoded.nombreUsuario);
    
    // Agregar la información del usuario al request
    req.user = decoded;
    req.isAuthenticated = true;
    
    next();
  } catch (error) {
    console.error('❌ Error en middleware de autenticación:', error);
    // En lugar de rechazar, permitir continuar pero marcar como no autenticado
    req.user = null;
    req.isAuthenticated = false;
    next();
  }
};

// Middleware más estricto para rutas que requieren autenticación obligatoria
const requireAuth = (req, res, next) => {
  console.log('🔒 RequireAuth ejecutándose para:', req.method, req.path);
  console.log('👤 Usuario autenticado:', req.isAuthenticated);
  
  if (!req.isAuthenticated || !req.user) {
    console.log('❌ Acceso denegado - autenticación requerida');
    return res.status(401).json({ message: 'Autenticación requerida' });
  }
  console.log('✅ Acceso permitido');
  next();
};

module.exports = { authMiddleware, requireAuth }; 
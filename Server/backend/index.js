require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Importar rutas
const authRoutes = require('./routes/auth');
const programacionMenuRoutes = require('./routes/programacionMenu');
const clientesRoutes = require('./routes/clientes');
const quejasRoutes = require('./routes/quejas');
const productosRoutes = require('./routes/productos');
const cajaChicaRoutes = require('./routes/cajaChica');
const movimientoCajaChicaRoutes = require('./routes/movimientoCajaChica');
const sugerenciasRoutes = require('./routes/sugerencias');
const contratosRoutes = require('./routes/contratos');
const abonosRoutes = require('./routes/abonos');
const mercadopagoRoutes = require('./routes/mercadopago');

const app = express();

// Configuración de CORS para permitir el frontend
const corsOptions = {
  origin: [
    'http://localhost:5173', // Desarrollo local
    'http://localhost:3000', // Desarrollo local alternativo
    'https://lunchieware-frontend.vercel.app', // Frontend en Vercel
    'https://lunchieware.vercel.app', // Si usas un dominio personalizado
    /\.vercel\.app$/, // Cualquier subdominio de Vercel
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

// Ruta de prueba
// app.get('/', (req, res) => {
//   res.json({ 
//     message: 'API de Lunchieware funcionando correctamente',
//     version: '1.0.0',
//     endpoints: {
//       auth: '/api/auth',
//       programacionMenu: '/api/programacion-menu',
//       clientes: '/api/clientes',
//       quejas: '/api/quejas',
//       sugerencias: '/api/sugerencias',
//       productos: '/api/productos',
//       cajaChica: '/api/cajachica',
//       movimientosCajaChica: '/api/movimientos-cajachica',
//       test: '/api/test'
//     }
//   });
// });

// Ruta de prueba para la base de datos
app.get('/api/test', async (req, res) => {
  try {
    const pool = require('./db');
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      message: 'Conexión a la base de datos exitosa',
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error conectando a la base de datos',
      error: error.message 
    });
  }
});

// Ruta simple de menú
app.get('/api/menu', (req, res) => {
  res.json({ message: 'Menu endpoint funcionando' });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/programacion-menu', programacionMenuRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/quejas', quejasRoutes);
app.use('/api/sugerencias', sugerenciasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/cajachica', cajaChicaRoutes);
app.use('/api/movimientos-cajachica', movimientoCajaChicaRoutes);
app.use('/api/contratos', contratosRoutes);
app.use('/api/abonos', abonosRoutes);
app.use('/api/mercadopago', mercadopagoRoutes);

// Middleware para manejar errores
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 API disponible en: http://localhost:${PORT}`);
  console.log(`🔐 Endpoints de autenticación: http://localhost:${PORT}/api/auth`);
  console.log(`🍽️  Endpoints de menú: http://localhost:${PORT}/api/programacion-menu`);
  console.log(`👥 Endpoints de clientes: http://localhost:${PORT}/api/clientes`);
  console.log(`📝 Endpoints de quejas: http://localhost:${PORT}/api/quejas`);
  console.log(`📦 Endpoints de sugerencias: http://localhost:${PORT}/api/sugerencias`);
  console.log(`📦 Endpoints de productos: http://localhost:${PORT}/api/productos`);
  console.log(`💰 Endpoints de caja chica: http://localhost:${PORT}/api/cajachica`);
  console.log(`📊 Endpoints de movimientos caja chica: http://localhost:${PORT}/api/movimientos-cajachica`);
  console.log(`📄 Endpoints de contratos: http://localhost:${PORT}/api/contratos`);
  console.log(`📄 Endpoints de abonos: http://localhost:${PORT}/api/abonos`);
  console.log(`📄 Endpoints de Mercado Pago: http://localhost:${PORT}/api/mercadopago`);
});

module.exports = app;

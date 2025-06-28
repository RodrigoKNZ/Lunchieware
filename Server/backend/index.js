require('dotenv').config();
const express = require('express');
const cors = require('cors');

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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Lunchieware funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      programacionMenu: '/api/programacion-menu',
      clientes: '/api/clientes',
      quejas: '/api/quejas',
      sugerencias: '/api/sugerencias',
      productos: '/api/productos',
      cajaChica: '/api/cajachica',
      movimientosCajaChica: '/api/movimientos-cajachica',
      test: '/api/test'
    }
  });
});

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

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

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
});

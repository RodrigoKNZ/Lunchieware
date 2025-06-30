const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const path = require('path');
const https = require('https');

const app = express();
const PORT = 3000;

// Configuración del proxy
const proxyConfig = {
  target: 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api', // Mantener la ruta /api
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔄 Proxy: ${req.method} ${req.path} -> ${proxyConfig.target}${req.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`✅ Respuesta: ${req.method} ${req.path} - ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error(`❌ Error en proxy: ${err.message}`);
    res.status(500).json({ error: 'Error en el proxy' });
  }
};

// Middleware para logging
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Proxy para la API del backend
app.use('/api', createProxyMiddleware(proxyConfig));

// Ruta de salud del proxy
app.get('/health', (req, res) => {
  res.json({ 
    message: 'Proxy local funcionando',
    timestamp: new Date().toISOString(),
    backend: 'http://localhost:5000',
    frontend: 'http://localhost:5173'
  });
});

// Ruta de información
app.get('/', (req, res) => {
  res.json({
    message: 'Proxy local de Lunchieware',
    endpoints: {
      api: '/api/*',
      health: '/health'
    },
    services: {
      backend: 'http://localhost:5000',
      frontend: 'http://localhost:5173'
    }
  });
});

// Iniciar servidor HTTP
app.listen(PORT, () => {
  console.log(`🚀 Proxy local iniciado en puerto ${PORT}`);
  console.log(`📡 Proxy API: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Redirigiendo API calls a: http://localhost:5000`);
});

// Función para iniciar con HTTPS si los certificados existen
function startHttps() {
  const certPath = path.join(__dirname, '..', 'ssl', 'localhost.pem');
  const keyPath = path.join(__dirname, '..', 'ssl', 'localhost-key.pem');
  
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    
    https.createServer(httpsOptions, app).listen(PORT + 1, () => {
      console.log(`🔐 Proxy HTTPS iniciado en puerto ${PORT + 1}`);
      console.log(`📡 Proxy API HTTPS: https://localhost:${PORT + 1}/api`);
    });
  }
}

// Intentar iniciar HTTPS
startHttps(); 
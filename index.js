// Punto de entrada para Vercel
// Este archivo redirige al backend
const path = require('path');
const backendPath = path.join(__dirname, 'Server', 'backend', 'index.js');

// Importar y exportar el backend
module.exports = require(backendPath); 
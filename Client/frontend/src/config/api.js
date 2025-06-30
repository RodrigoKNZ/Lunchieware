// Configuración de URLs de API
const isDevelopment = import.meta.env.DEV;

// URL base de la API
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000/api' 
  : 'https://lunchieware-backend.vercel.app/api';

// URLs específicas para cada servicio
export const API_URLS = {
  auth: `${API_BASE_URL}/auth`,
  clientes: `${API_BASE_URL}/clientes`,
  quejas: `${API_BASE_URL}/quejas`,
  sugerencias: `${API_BASE_URL}/sugerencias`,
  productos: `${API_BASE_URL}/productos`,
  cajaChica: `${API_BASE_URL}/cajachica`,
  movimientosCajaChica: `${API_BASE_URL}/movimientos-cajachica`,
  contratos: `${API_BASE_URL}/contratos`,
  abonos: `${API_BASE_URL}/abonos`,
  mercadopago: `${API_BASE_URL}/mercadopago`,
  programacionMenu: `${API_BASE_URL}/programacion-menu`,
};

export default API_BASE_URL; 
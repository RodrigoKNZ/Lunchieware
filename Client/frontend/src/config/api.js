import axios from 'axios';

// Configuración de URLs de API
const isDevelopment = import.meta.env.MODE === 'development';

// URL base de la API
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000/api' 
  : 'https://lunchieware-back.vercel.app/api';

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

// Configurar axios para enviar automáticamente el token JWT
axios.defaults.baseURL = API_BASE_URL;

// Interceptor para agregar el token a todas las peticiones
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API_BASE_URL; 
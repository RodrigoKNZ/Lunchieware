import axios from 'axios';

// Configuración de URLs de API
const isDevelopment = import.meta.env.MODE === 'development';
const isProductionSim = import.meta.env.MODE === 'production-sim';

// URL base de la API
let API_BASE_URL;
if (isProductionSim) {
  // Simulación de producción local con HTTPS
  API_BASE_URL = 'https://localhost:5000/api';
} else if (isDevelopment) {
  // Desarrollo local normal
  API_BASE_URL = 'http://localhost:5000/api';
} else {
  // Producción real en Vercel
  API_BASE_URL = 'https://lunchieware-back.vercel.app/api';
}

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

// Crear una instancia de axios con configuración personalizada
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para agregar el token a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Token en localStorage:', token ? 'Presente' : 'No encontrado');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Header Authorization agregado:', config.headers.Authorization);
    }
    return config;
  },
  (error) => {
    console.error('Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Error en respuesta:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Exportar la instancia configurada
export default apiClient; 
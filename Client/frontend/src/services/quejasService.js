import axios from 'axios';
import { API_URLS } from '../config/api';

const quejasService = {
  // Obtener todas las quejas
  obtenerTodas: async () => {
    const response = await axios.get(API_URLS.quejas);
    return response;
  },

  // Obtener queja por ID
  obtenerPorId: async (id) => {
    const response = await axios.get(`${API_URLS.quejas}/${id}`);
    return response;
  },

  // Crear nueva queja
  crear: async (queja) => {
    const response = await axios.post(API_URLS.quejas, queja);
    return response;
  },

  // Actualizar queja
  actualizar: async (id, queja) => {
    const response = await axios.put(`${API_URLS.quejas}/${id}`, queja);
    return response;
  },

  // Eliminar queja
  eliminar: async (id) => {
    const response = await axios.delete(`${API_URLS.quejas}/${id}`);
    return response;
  },

  // Obtener estadísticas
  async obtenerEstadisticas() {
    const response = await axios.get(`${API_URLS.quejas}/estadisticas/totales`);
    return response.data;
  }
};

export default quejasService; 
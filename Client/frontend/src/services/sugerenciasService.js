import axios from 'axios';
import { API_URLS } from '../config/api';

const sugerenciasService = {
  // Obtener todas las sugerencias
  obtenerTodas: async () => {
    const response = await axios.get(API_URLS.sugerencias);
    return response;
  },

  // Obtener sugerencia por ID
  obtenerPorId: async (id) => {
    const response = await axios.get(`${API_URLS.sugerencias}/${id}`);
    return response;
  },

  // Crear nueva sugerencia
  crear: async (sugerencia) => {
    const response = await axios.post(API_URLS.sugerencias, sugerencia);
    return response;
  },

  // Actualizar sugerencia
  actualizar: async (id, sugerencia) => {
    const response = await axios.put(`${API_URLS.sugerencias}/${id}`, sugerencia);
    return response;
  },

  // Eliminar sugerencia
  eliminar: async (id) => {
    const response = await axios.delete(`${API_URLS.sugerencias}/${id}`);
    return response;
  },

  // Obtener estadísticas
  async obtenerEstadisticas() {
    const response = await axios.get(`${API_URLS.sugerencias}/estadisticas/totales`);
    return response.data;
  }
};

export default sugerenciasService; 
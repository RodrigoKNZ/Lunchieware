import apiClient from '../config/api';

const sugerenciasService = {
  // Obtener todas las sugerencias
  obtenerTodas: async () => {
    const response = await apiClient.get('/sugerencias');
    return response;
  },

  // Obtener sugerencia por ID
  obtenerPorId: async (id) => {
    const response = await apiClient.get(`/sugerencias/${id}`);
    return response;
  },

  // Crear nueva sugerencia
  crear: async (sugerencia) => {
    const response = await apiClient.post('/sugerencias', sugerencia);
    return response;
  },

  // Actualizar sugerencia
  actualizar: async (id, sugerencia) => {
    const response = await apiClient.put(`/sugerencias/${id}`, sugerencia);
    return response;
  },

  // Eliminar sugerencia
  eliminar: async (id) => {
    const response = await apiClient.delete(`/sugerencias/${id}`);
    return response;
  },

  // Obtener estadísticas
  async obtenerEstadisticas() {
    const response = await apiClient.get('/sugerencias/estadisticas/totales');
    return response.data;
  }
};

export default sugerenciasService; 
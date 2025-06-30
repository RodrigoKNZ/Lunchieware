import apiClient from '../config/api';

const quejasService = {
  // Obtener todas las quejas
  obtenerTodas: async () => {
    const response = await apiClient.get('/quejas');
    return response;
  },

  // Obtener queja por ID
  obtenerPorId: async (id) => {
    const response = await apiClient.get(`/quejas/${id}`);
    return response;
  },

  // Crear nueva queja
  crear: async (queja) => {
    const response = await apiClient.post('/quejas', queja);
    return response;
  },

  // Actualizar queja
  actualizar: async (id, queja) => {
    const response = await apiClient.put(`/quejas/${id}`, queja);
    return response;
  },

  // Eliminar queja
  eliminar: async (id) => {
    const response = await apiClient.delete(`/quejas/${id}`);
    return response;
  },

  // Obtener estadísticas
  async obtenerEstadisticas() {
    const response = await apiClient.get('/quejas/estadisticas/totales');
    return response.data;
  }
};

export default quejasService; 
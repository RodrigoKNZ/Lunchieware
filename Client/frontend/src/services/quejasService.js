import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/quejas';

const quejasService = {
  // Obtener todas las quejas
  async obtenerTodas() {
    const response = await axios.get(`${API_BASE_URL}`);
    return response.data;
  },

  // Obtener queja por ID
  async obtenerPorId(id) {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Crear nueva queja
  async crear(queja) {
    const response = await axios.post(`${API_BASE_URL}`, queja);
    return response.data;
  },

  // Actualizar queja
  async actualizar(id, queja) {
    const response = await axios.put(`${API_BASE_URL}/${id}`, queja);
    return response.data;
  },

  // Eliminar queja
  async eliminar(id) {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Obtener estadísticas
  async obtenerEstadisticas() {
    const response = await axios.get(`${API_BASE_URL}/estadisticas/totales`);
    return response.data;
  }
};

export default quejasService; 
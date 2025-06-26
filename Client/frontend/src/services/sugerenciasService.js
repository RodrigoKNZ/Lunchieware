import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/sugerencias';

const sugerenciasService = {
  // Obtener todas las sugerencias
  async obtenerTodas() {
    const response = await axios.get(`${API_BASE_URL}`);
    return response.data;
  },

  // Obtener sugerencia por ID
  async obtenerPorId(id) {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Crear nueva sugerencia
  async crear(sugerencia) {
    const response = await axios.post(`${API_BASE_URL}`, sugerencia);
    return response.data;
  },

  // Actualizar sugerencia
  async actualizar(id, sugerencia) {
    const response = await axios.put(`${API_BASE_URL}/${id}`, sugerencia);
    return response.data;
  },

  // Eliminar sugerencia
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

export default sugerenciasService; 
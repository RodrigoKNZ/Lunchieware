import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/abonos';

const abonosService = {
  // Obtener todos los abonos
  async obtenerTodos() {
    const response = await axios.get(`${API_BASE_URL}`);
    return response.data;
  },

  // Obtener abono por ID
  async obtenerPorId(id) {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Obtener abonos por contrato
  async obtenerPorContrato(idContrato) {
    const response = await axios.get(`${API_BASE_URL}/contrato/${idContrato}`);
    return response.data;
  },

  // Obtener abonos por cliente
  async obtenerPorCliente(idCliente) {
    const response = await axios.get(`${API_BASE_URL}/cliente/${idCliente}`);
    return response.data;
  },

  // Crear nuevo abono
  async crear(abono) {
    const response = await axios.post(`${API_BASE_URL}`, abono);
    return response.data;
  },

  // Actualizar abono
  async actualizar(id, abono) {
    const response = await axios.put(`${API_BASE_URL}/${id}`, abono);
    return response.data;
  },

  // Eliminar abono
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

export default abonosService; 
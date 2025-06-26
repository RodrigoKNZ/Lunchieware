import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/programacion-menu';

const programacionMenuService = {
  // Obtener todos los menús
  async obtenerTodos() {
    const response = await axios.get(`${API_BASE_URL}`);
    return response.data;
  },

  // Obtener menú por fecha
  async obtenerPorFecha(fecha) {
    const response = await axios.get(`${API_BASE_URL}/fecha/${fecha}`);
    return response.data;
  },

  // Obtener menús por rango de fechas
  async obtenerPorRangoFechas(fechaInicio, fechaFin) {
    const response = await axios.get(`${API_BASE_URL}/rango/${fechaInicio}/${fechaFin}`);
    return response.data;
  },

  // Obtener menú por ID
  async obtenerPorId(id) {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Crear nuevo menú
  async crear(menu) {
    const response = await axios.post(`${API_BASE_URL}`, menu);
    return response.data;
  },

  // Actualizar menú
  async actualizar(id, menu) {
    const response = await axios.put(`${API_BASE_URL}/${id}`, menu);
    return response.data;
  },

  // Eliminar menú
  async eliminar(id) {
    const response = await axios.delete(`${API_BASE_URL}/${id}`);
    return response.data;
  }
};

export default programacionMenuService; 
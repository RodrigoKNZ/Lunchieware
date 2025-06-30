import axios from 'axios';
import { API_URLS } from '../config/api';

const programacionMenuService = {
  // Obtener todos los menús
  async obtenerTodos() {
    const response = await axios.get(API_URLS.programacionMenu);
    return response.data;
  },

  // Obtener menú por fecha
  async obtenerPorFecha(fecha) {
    const response = await axios.get(`${API_URLS.programacionMenu}/fecha/${fecha}`);
    return response.data;
  },

  // Obtener menús por rango de fechas
  async obtenerPorRangoFechas(fechaInicio, fechaFin) {
    const response = await axios.get(`${API_URLS.programacionMenu}/rango/${fechaInicio}/${fechaFin}`);
    return response.data;
  },

  // Obtener menú por ID
  async obtenerPorId(id) {
    const response = await axios.get(`${API_URLS.programacionMenu}/${id}`);
    return response.data;
  },

  // Crear nuevo menú
  async crear(menu) {
    const response = await axios.post(API_URLS.programacionMenu, menu);
    return response.data;
  },

  // Actualizar menú
  async actualizar(id, menu) {
    const response = await axios.put(`${API_URLS.programacionMenu}/${id}`, menu);
    return response.data;
  },

  // Eliminar menú
  async eliminar(id) {
    const response = await axios.delete(`${API_URLS.programacionMenu}/${id}`);
    return response.data;
  }
};

export default programacionMenuService; 
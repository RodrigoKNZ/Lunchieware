import axios from 'axios';
import { API_URLS } from '../config/api';

const abonosService = {
  // Obtener todos los abonos
  obtenerTodos: async () => {
    const response = await axios.get(API_URLS.abonos);
    return response;
  },

  // Obtener abono por ID
  obtenerPorId: async (id) => {
    const response = await axios.get(`${API_URLS.abonos}/${id}`);
    return response;
  },

  // Obtener abonos por contrato
  async obtenerPorContrato(idContrato) {
    const response = await axios.get(`${API_URLS.abonos}/contrato/${idContrato}`);
    return response.data;
  },

  // Obtener abonos por cliente
  async obtenerPorCliente(idCliente) {
    const response = await axios.get(`${API_URLS.abonos}/cliente/${idCliente}`);
    return response.data;
  },

  // Crear nuevo abono
  crear: async (abono) => {
    const response = await axios.post(API_URLS.abonos, abono);
    return response;
  },

  // Actualizar abono
  actualizar: async (id, abono) => {
    const response = await axios.put(`${API_URLS.abonos}/${id}`, abono);
    return response;
  },

  // Eliminar abono
  eliminar: async (id) => {
    const response = await axios.delete(`${API_URLS.abonos}/${id}`);
    return response;
  },

  // Obtener estadísticas
  async obtenerEstadisticas() {
    const response = await axios.get(`${API_URLS.abonos}/estadisticas/totales`);
    return response.data;
  }
};

export default abonosService; 
import axios from 'axios';
import { API_URLS } from '../config/api';

const clienteService = {
  // Obtener cliente por ID de usuario
  async obtenerPorUsuario(idUsuario) {
    const response = await axios.get(`${API_URLS.clientes}/usuario/${idUsuario}`);
    return response.data;
  },

  // Obtener cliente por ID
  async obtenerPorId(idCliente) {
    const response = await axios.get(`${API_URLS.clientes}/${idCliente}`);
    return response.data;
  },

  // Obtener todos los clientes
  async obtenerTodos() {
    const response = await axios.get(API_URLS.clientes);
    return response.data;
  },

  // Crear nuevo cliente
  async crear(cliente) {
    const response = await axios.post(API_URLS.clientes, cliente);
    return response.data;
  },

  // Actualizar cliente
  async actualizar(idCliente, cliente) {
    const response = await axios.put(`${API_URLS.clientes}/${idCliente}`, cliente);
    return response.data;
  },

  // Eliminar cliente
  async eliminar(idCliente) {
    const response = await axios.delete(`${API_URLS.clientes}/${idCliente}`);
    return response.data;
  },

  // Carga/actualización masiva de clientes
  async cargaMasiva(clientes) {
    const response = await axios.post(`${API_URLS.clientes}/masivo`, clientes);
    return response.data;
  },

  // Obtener contratos de un cliente
  async obtenerContratos(idCliente) {
    const response = await axios.get(`${API_URLS.contratos}/cliente/${idCliente}`);
    return response.data;
  }
};

export default clienteService; 
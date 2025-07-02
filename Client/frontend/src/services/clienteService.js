import apiClient from '../config/api';

const clienteService = {
  // Obtener cliente por ID de usuario
  async obtenerPorUsuario(idUsuario) {
    const response = await apiClient.get(`/clientes/usuario/${idUsuario}`);
    return response.data;
  },

  // Obtener cliente por ID
  async obtenerPorId(idCliente) {
    const response = await apiClient.get(`/clientes/${idCliente}`);
    return response.data;
  },

  // Obtener todos los clientes
  async obtenerTodos() {
    const response = await apiClient.get('/clientes');
    return response.data;
  },

  // Crear nuevo cliente
  async crear(cliente) {
    const response = await apiClient.post('/clientes', cliente);
    return response.data;
  },

  // Actualizar cliente
  async actualizar(idCliente, cliente) {
    const response = await apiClient.put(`/clientes/${idCliente}`, cliente);
    return response.data;
  },

  // Eliminar cliente
  async eliminar(idCliente) {
    const response = await apiClient.delete(`/clientes/${idCliente}`);
    return response.data;
  },

  // Carga/actualización masiva de clientes
  async cargaMasiva(clientes) {
    const response = await apiClient.post('/clientes/masivo', clientes);
    return response.data;
  },

  // Obtener contratos de un cliente
  async obtenerContratos(idCliente) {
    const response = await apiClient.get(`/contratos/cliente/${idCliente}`);
    return response.data;
  },

  // Obtener cliente por código
  async obtenerPorCodigo(codigo) {
    const response = await apiClient.get(`/clientes/codigo/${codigo}`);
    return response.data;
  }
};

export default clienteService; 
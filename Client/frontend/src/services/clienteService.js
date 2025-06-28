import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/clientes';

const clienteService = {
  // Obtener cliente por ID de usuario
  async obtenerPorUsuario(idUsuario) {
    const response = await axios.get(`${API_BASE_URL}/usuario/${idUsuario}`);
    return response.data;
  },

  // Obtener cliente por ID
  async obtenerPorId(idCliente) {
    const response = await axios.get(`${API_BASE_URL}/${idCliente}`);
    return response.data;
  },

  // Obtener todos los clientes
  async obtenerTodas() {
    const response = await axios.get(`${API_BASE_URL}`);
    return response.data;
  },

  // Crear nuevo cliente
  async crear(cliente) {
    const response = await axios.post(`${API_BASE_URL}`, cliente);
    return response.data;
  },

  // Actualizar cliente
  async actualizar(idCliente, cliente) {
    const response = await axios.put(`${API_BASE_URL}/${idCliente}`, cliente);
    return response.data;
  },

  // Eliminar cliente
  async eliminar(idCliente) {
    const response = await axios.delete(`${API_BASE_URL}/${idCliente}`);
    return response.data;
  },

  // Carga/actualización masiva de clientes
  async cargaMasiva(clientes) {
    const response = await axios.post(`${API_BASE_URL}/masivo`, clientes);
    return response.data;
  },

  // Obtener contratos por cliente
  async obtenerContratosPorCliente(idCliente) {
    const response = await axios.get(`http://localhost:5000/api/contratos/cliente/${idCliente}`);
    return response.data;
  }
};

export default clienteService; 
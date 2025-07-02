import api from '../config/api';

const bancosService = {
  async listar() {
    return api.get('/bancos');
  },
  async crear(datos) {
    return api.post('/bancos', datos);
  },
  async editar(id, datos) {
    return api.put(`/bancos/${id}`, datos);
  },
  async eliminar(id) {
    return api.delete(`/bancos/${id}`);
  }
};

export default bancosService; 
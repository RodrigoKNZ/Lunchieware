import api from '../config/api';

const cuentasBancariasService = {
  async listarPorBanco(idBanco) {
    return api.get(`/cuentas-bancarias/banco/${idBanco}`);
  },
  async crear(datos) {
    return api.post('/cuentas-bancarias', datos);
  },
  async editar(id, datos) {
    return api.put(`/cuentas-bancarias/${id}`, datos);
  },
  async eliminar(id) {
    return api.delete(`/cuentas-bancarias/${id}`);
  }
};

export default cuentasBancariasService; 
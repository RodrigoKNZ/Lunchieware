import api from '../config/api';

const devolucionesService = {
  async obtenerPorContrato(idContrato) {
    return api.get(`/devoluciones/contrato/${idContrato}`);
  },
  async obtenerPorId(id) {
    return api.get(`/devoluciones/${id}`);
  },
  async crear(datos) {
    return api.post('/devoluciones', datos);
  }
};

export default devolucionesService; 
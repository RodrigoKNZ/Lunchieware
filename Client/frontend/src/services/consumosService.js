import api from '../config/api';

const consumosService = {
  async obtenerPorContrato(idContrato) {
    return api.get(`/consumos/contrato/${idContrato}`);
  },
  async obtenerPorId(id) {
    return api.get(`/consumos/${id}`);
  }
};

export default consumosService; 
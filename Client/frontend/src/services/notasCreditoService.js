import api from '../config/api';

const notasCreditoService = {
  async obtenerPorContrato(idContrato) {
    return api.get(`/notas-credito/contrato/${idContrato}`);
  },
  async obtenerPorId(id) {
    return api.get(`/notas-credito/${id}`);
  },
  async crear(datos) {
    return api.post('/notas-credito', datos);
  },
  async actualizarCodigo(idNota, codigo) {
    return api.put(`/notas-credito/${idNota}/codigo`, { codigo });
  }
};

export default notasCreditoService; 
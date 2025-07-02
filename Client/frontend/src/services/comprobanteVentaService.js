import apiClient from '../config/api';

const comprobanteVentaService = {
  async registrarVenta(data) {
    const response = await apiClient.post('/comprobantes/registrar-venta', data);
    return response.data;
  },
  async obtenerPorContrato(idContrato) {
    return apiClient.get(`/comprobantes/contrato/${idContrato}`);
  }
};

export default comprobanteVentaService; 
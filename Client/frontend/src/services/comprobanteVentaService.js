import apiClient from '../config/api';

const comprobanteVentaService = {
  async registrarVenta(data) {
    const response = await apiClient.post('/comprobantes/registrar-venta', data);
    return response.data;
  }
};

export default comprobanteVentaService; 
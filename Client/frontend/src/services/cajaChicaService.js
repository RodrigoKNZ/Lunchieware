import apiClient from '../config/api';

const cajaChicaService = {
  // Obtener todas las cajas chicas
  obtenerTodas: async () => {
    const response = await apiClient.get('/cajachica');
    return response;
  },

  // Obtener caja chica por ID
  obtenerPorId: async (id) => {
    const response = await apiClient.get(`/cajachica/${id}`);
    return response;
  },

  // Obtener caja chica por numeroLiquidacion
  async obtenerPorNumeroLiquidacion(numeroLiquidacion) {
    const response = await apiClient.get(`/cajachica/numero/${numeroLiquidacion}`);
    return response.data;
  },

  // Crear nueva caja chica
  crear: async (cajaChica) => {
    const response = await apiClient.post('/cajachica', cajaChica);
    return response;
  },

  // Actualizar caja chica
  actualizar: async (id, cajaChica) => {
    const response = await apiClient.put(`/cajachica/${id}`, cajaChica);
    return response;
  },

  // Cerrar caja chica
  cerrar: async (id, datosCierre) => {
    const response = await apiClient.patch(`/cajachica/${id}/cerrar`, datosCierre);
    return response;
  },

  // Eliminar caja chica
  eliminar: async (id) => {
    const response = await apiClient.delete(`/cajachica/${id}`);
    return response;
  },

  // Filtrar cajas chicas
  async filtrar(params) {
    const response = await apiClient.get('/cajachica/filtrar', { params });
    return response.data;
  },

  // Obtener todos los movimientos de una caja chica
  obtenerMovimientos: async () => {
    const response = await apiClient.get('/movimientosCajaChica');
    return response;
  },

  // Obtener movimiento por ID
  async obtenerMovimiento(id) {
    const response = await apiClient.get(`/cajaChica/movimientos-cajachica/${id}`);
    return response.data;
  },

  // Crear nuevo movimiento
  async crearMovimiento(movimiento) {
    const response = await apiClient.post('/cajaChica/movimientos-cajachica', movimiento);
    return response.data;
  },

  // Actualizar movimiento
  async actualizarMovimiento(id, movimiento) {
    const response = await apiClient.put(`/cajaChica/movimientos-cajachica/${id}`, movimiento);
    return response.data;
  },

  // Eliminar movimiento
  async eliminarMovimiento(id) {
    const response = await apiClient.delete(`/cajaChica/movimientos-cajachica/${id}`);
    return response.data;
  },

  // Calcular saldo actual de una caja chica
  async calcularSaldoActual(idCajaChica) {
    const response = await apiClient.get(`/cajaChica/movimientos-cajachica/caja/${idCajaChica}/saldo`);
    return response.data;
  }
};

export default cajaChicaService; 
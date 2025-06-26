import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const cajaChicaService = {
  // Obtener todas las cajas chicas
  async obtenerTodas() {
    const response = await axios.get(`${API_BASE_URL}/cajachica`);
    return response.data;
  },

  // Obtener caja chica por ID
  async obtenerPorId(id) {
    const response = await axios.get(`${API_BASE_URL}/cajachica/${id}`);
    return response.data;
  },

  // Obtener caja chica por numeroLiquidacion
  async obtenerPorNumeroLiquidacion(numeroLiquidacion) {
    const response = await axios.get(`${API_BASE_URL}/cajachica/numero/${numeroLiquidacion}`);
    return response.data;
  },

  // Crear nueva caja chica
  async crear(caja) {
    const response = await axios.post(`${API_BASE_URL}/cajachica`, caja);
    return response.data;
  },

  // Actualizar caja chica (observaciones)
  async actualizar(id, caja) {
    const response = await axios.put(`${API_BASE_URL}/cajachica/${id}`, caja);
    return response.data;
  },

  // Cerrar (liquidar) caja chica
  async cerrar(id, data) {
    const response = await axios.patch(`${API_BASE_URL}/cajachica/${id}/cerrar`, data);
    return response.data;
  },

  // Eliminar caja chica
  async eliminar(id) {
    const response = await axios.delete(`${API_BASE_URL}/cajachica/${id}`);
    return response.data;
  },

  // Filtrar cajas chicas
  async filtrar(params) {
    const response = await axios.get(`${API_BASE_URL}/cajachica/filtrar`, { params });
    return response.data;
  },

  // Obtener todos los movimientos de una caja chica
  async obtenerMovimientos(idCajaChica) {
    const response = await axios.get(`${API_BASE_URL}/movimientos-cajachica/caja/${idCajaChica}`);
    return response.data;
  },

  // Obtener movimiento por ID
  async obtenerMovimiento(id) {
    const response = await axios.get(`${API_BASE_URL}/movimientos-cajachica/${id}`);
    return response.data;
  },

  // Crear nuevo movimiento
  async crearMovimiento(movimiento) {
    const response = await axios.post(`${API_BASE_URL}/movimientos-cajachica`, movimiento);
    return response.data;
  },

  // Actualizar movimiento
  async actualizarMovimiento(id, movimiento) {
    const response = await axios.put(`${API_BASE_URL}/movimientos-cajachica/${id}`, movimiento);
    return response.data;
  },

  // Eliminar movimiento
  async eliminarMovimiento(id) {
    const response = await axios.delete(`${API_BASE_URL}/movimientos-cajachica/${id}`);
    return response.data;
  },

  // Calcular saldo actual de una caja chica
  async calcularSaldoActual(idCajaChica) {
    const response = await axios.get(`${API_BASE_URL}/movimientos-cajachica/caja/${idCajaChica}/saldo`);
    return response.data;
  }
};

export default cajaChicaService; 
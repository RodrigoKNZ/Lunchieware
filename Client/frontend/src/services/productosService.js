import apiClient from '../config/api';

const productosService = {
  // Obtener todos los productos
  obtenerTodos: async () => {
    const response = await apiClient.get('/productos');
    return response;
  },

  // Obtener producto por ID
  obtenerPorId: async (id) => {
    const response = await apiClient.get(`/productos/${id}`);
    return response;
  },

  // Buscar productos por nombre
  async buscarPorNombre(nombre) {
    try {
      const response = await apiClient.get(`/productos/buscar/${nombre}`);
      return response.data;
    } catch (error) {
      console.error('Error buscando productos:', error);
      throw error;
    }
  },

  // Obtener productos por tipo
  async obtenerPorTipo(tipo) {
    try {
      const response = await apiClient.get(`/productos/tipo/${tipo}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo productos por tipo:', error);
      throw error;
    }
  },

  // Obtener productos disponibles
  async obtenerDisponibles() {
    try {
      const response = await apiClient.get(`/productos/disponibles/todos`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo productos disponibles:', error);
      throw error;
    }
  },

  // Crear nuevo producto
  crear: async (producto) => {
    const response = await apiClient.post('/productos', producto);
    return response;
  },

  // Actualizar producto
  actualizar: async (id, producto) => {
    const response = await apiClient.put(`/productos/${id}`, producto);
    return response;
  },

  // Cambiar disponibilidad del producto
  async cambiarDisponibilidad(id, disponible) {
    try {
      const response = await apiClient.patch(`/productos/${id}/disponibilidad`, { disponible });
      return response.data;
    } catch (error) {
      console.error('Error cambiando disponibilidad:', error);
      throw error;
    }
  },

  // Eliminar producto
  eliminar: async (id) => {
    const response = await apiClient.delete(`/productos/${id}`);
    return response;
  },

  // Obtener estadísticas
  async obtenerEstadisticas() {
    try {
      const response = await apiClient.get('/productos/estadisticas/totales');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
};

const comprobanteVentaService = {
  async registrarVenta(data) {
    const response = await apiClient.post('/comprobantes/registrar-venta', data);
    return response.data;
  }
};

export default { ...productosService, ...comprobanteVentaService }; 
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const productosService = {
  // Obtener todos los productos
  async obtenerTodos() {
    try {
      const response = await axios.get(`${API_BASE_URL}/productos`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      throw error;
    }
  },

  // Obtener producto por ID
  async obtenerPorId(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/productos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo producto:', error);
      throw error;
    }
  },

  // Buscar productos por nombre
  async buscarPorNombre(nombre) {
    try {
      const response = await axios.get(`${API_BASE_URL}/productos/buscar/${nombre}`);
      return response.data;
    } catch (error) {
      console.error('Error buscando productos:', error);
      throw error;
    }
  },

  // Obtener productos por tipo
  async obtenerPorTipo(tipo) {
    try {
      const response = await axios.get(`${API_BASE_URL}/productos/tipo/${tipo}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo productos por tipo:', error);
      throw error;
    }
  },

  // Obtener productos disponibles
  async obtenerDisponibles() {
    try {
      const response = await axios.get(`${API_BASE_URL}/productos/disponibles/todos`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo productos disponibles:', error);
      throw error;
    }
  },

  // Crear nuevo producto
  async crear(producto) {
    try {
      const response = await axios.post(`${API_BASE_URL}/productos`, producto);
      return response.data;
    } catch (error) {
      console.error('Error creando producto:', error);
      throw error;
    }
  },

  // Actualizar producto
  async actualizar(id, producto) {
    try {
      const response = await axios.put(`${API_BASE_URL}/productos/${id}`, producto);
      return response.data;
    } catch (error) {
      console.error('Error actualizando producto:', error);
      throw error;
    }
  },

  // Cambiar disponibilidad del producto
  async cambiarDisponibilidad(id, disponible) {
    try {
      const response = await axios.patch(`${API_BASE_URL}/productos/${id}/disponibilidad`, { disponible });
      return response.data;
    } catch (error) {
      console.error('Error cambiando disponibilidad:', error);
      throw error;
    }
  },

  // Eliminar producto
  async eliminar(id) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/productos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando producto:', error);
      throw error;
    }
  },

  // Obtener estadísticas
  async obtenerEstadisticas() {
    try {
      const response = await axios.get(`${API_BASE_URL}/productos/estadisticas/totales`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
};

export default productosService; 
import axios from 'axios';
import { API_URLS } from '../config/api';

const productosService = {
  // Obtener todos los productos
  obtenerTodos: async () => {
    const response = await axios.get(`${API_URLS.productos}/productos`);
    return response;
  },

  // Obtener producto por ID
  obtenerPorId: async (id) => {
    const response = await axios.get(`${API_URLS.productos}/productos/${id}`);
    return response;
  },

  // Buscar productos por nombre
  async buscarPorNombre(nombre) {
    try {
      const response = await axios.get(`${API_URLS.productos}/productos/buscar/${nombre}`);
      return response.data;
    } catch (error) {
      console.error('Error buscando productos:', error);
      throw error;
    }
  },

  // Obtener productos por tipo
  async obtenerPorTipo(tipo) {
    try {
      const response = await axios.get(`${API_URLS.productos}/productos/tipo/${tipo}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo productos por tipo:', error);
      throw error;
    }
  },

  // Obtener productos disponibles
  async obtenerDisponibles() {
    try {
      const response = await axios.get(`${API_URLS.productos}/productos/disponibles/todos`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo productos disponibles:', error);
      throw error;
    }
  },

  // Crear nuevo producto
  crear: async (producto) => {
    const response = await axios.post(`${API_URLS.productos}/productos`, producto);
    return response;
  },

  // Actualizar producto
  actualizar: async (id, producto) => {
    const response = await axios.put(`${API_URLS.productos}/productos/${id}`, producto);
    return response;
  },

  // Cambiar disponibilidad del producto
  async cambiarDisponibilidad(id, disponible) {
    try {
      const response = await axios.patch(`${API_URLS.productos}/productos/${id}/disponibilidad`, { disponible });
      return response.data;
    } catch (error) {
      console.error('Error cambiando disponibilidad:', error);
      throw error;
    }
  },

  // Eliminar producto
  eliminar: async (id) => {
    const response = await axios.delete(`${API_URLS.productos}/productos/${id}`);
    return response;
  },

  // Obtener estadísticas
  async obtenerEstadisticas() {
    try {
      const response = await axios.get(`${API_URLS.productos}/productos/estadisticas/totales`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
};

export default productosService; 
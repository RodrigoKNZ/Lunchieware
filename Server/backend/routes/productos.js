const express = require('express');
const productosModel = require('../models/productos');
const { authMiddleware, requireAuth } = require('../middleware/auth');

const router = express.Router();

// Temporalmente deshabilitado para pruebas
// router.use(authMiddleware);

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const productos = await productosModel.obtenerTodos();
    res.json({
      message: 'Productos obtenidos exitosamente',
      data: productos
    });
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener producto por ID
router.get('/:id(\d+)', async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await productosModel.obtenerPorId(id);
    
    if (!producto) {
      return res.status(404).json({ 
        message: 'Producto no encontrado' 
      });
    }

    res.json({
      message: 'Producto obtenido exitosamente',
      data: producto
    });
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Buscar productos por nombre
router.get('/buscar/:nombre', async (req, res) => {
  try {
    const { nombre } = req.params;
    const productos = await productosModel.buscarPorNombre(nombre);
    
    res.json({
      message: 'Búsqueda completada',
      data: productos
    });
  } catch (error) {
    console.error('Error buscando productos:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener productos por tipo
router.get('/tipo/:tipo', async (req, res) => {
  try {
    const { tipo } = req.params;
    const productos = await productosModel.obtenerPorTipo(tipo);
    
    res.json({
      message: 'Productos obtenidos exitosamente',
      data: productos
    });
  } catch (error) {
    console.error('Error obteniendo productos por tipo:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener productos disponibles
router.get('/disponibles/todos', async (req, res) => {
  try {
    const productos = await productosModel.obtenerDisponibles();
    res.json({
      message: 'Productos disponibles obtenidos exitosamente',
      data: productos
    });
  } catch (error) {
    console.error('Error obteniendo productos disponibles:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener productos afectos a IGV
router.get('/afectos-igv/todos', async (req, res) => {
  try {
    const productos = await productosModel.obtenerAfectosIGV();
    res.json({
      message: 'Productos afectos a IGV obtenidos exitosamente',
      data: productos
    });
  } catch (error) {
    console.error('Error obteniendo productos afectos a IGV:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Crear nuevo producto
router.post('/', async (req, res) => {
  try {
    const {
      codigoProducto,
      nombreProducto,
      nombreCorto,
      tipoProducto,
      costoUnitario,
      afectoIGV,
      disponible,
      activo
    } = req.body;

    if (!codigoProducto || !nombreProducto || !nombreCorto || !tipoProducto || costoUnitario === undefined) {
      return res.status(400).json({ 
        message: 'Los campos código, nombre, nombre corto, tipo y costo unitario son requeridos' 
      });
    }

    // Verificar si ya existe un producto con ese código
    const productoExistente = await productosModel.obtenerPorCodigo(codigoProducto);
    if (productoExistente) {
      return res.status(400).json({ 
        message: 'Ya existe un producto con ese código' 
      });
    }

    const nuevoProducto = await productosModel.crear({
      codigoProducto,
      nombreProducto,
      nombreCorto,
      tipoProducto,
      costoUnitario,
      afectoIGV,
      disponible,
      activo
    });

    res.status(201).json({
      message: 'Producto creado exitosamente',
      data: nuevoProducto
    });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Actualizar producto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    const productoExistente = await productosModel.obtenerPorId(id);
    if (!productoExistente) {
      return res.status(404).json({ 
        message: 'Producto no encontrado' 
      });
    }

    const productoActualizado = await productosModel.actualizar(id, datos);

    res.json({
      message: 'Producto actualizado exitosamente',
      data: productoActualizado
    });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Cambiar disponibilidad del producto
router.patch('/:id/disponibilidad', async (req, res) => {
  try {
    const { id } = req.params;
    const { disponible } = req.body;

    const productoExistente = await productosModel.obtenerPorId(id);
    if (!productoExistente) {
      return res.status(404).json({ 
        message: 'Producto no encontrado' 
      });
    }

    const productoActualizado = await productosModel.cambiarDisponibilidad(id, disponible);

    res.json({
      message: 'Disponibilidad del producto actualizada exitosamente',
      data: productoActualizado
    });
  } catch (error) {
    console.error('Error cambiando disponibilidad:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Eliminar producto (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const productoExistente = await productosModel.obtenerPorId(id);
    if (!productoExistente) {
      return res.status(404).json({ 
        message: 'Producto no encontrado' 
      });
    }

    await productosModel.eliminar(id);

    res.json({
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener estadísticas de productos
router.get('/estadisticas/totales', async (req, res) => {
  try {
    const estadisticas = await productosModel.obtenerEstadisticas();
    res.json({
      message: 'Estadísticas obtenidas exitosamente',
      data: estadisticas
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener productos por rango de precios
router.get('/precios/:min/:max', async (req, res) => {
  try {
    const { min, max } = req.params;
    const productos = await productosModel.obtenerPorRangoPrecios(parseFloat(min), parseFloat(max));
    
    res.json({
      message: 'Productos obtenidos exitosamente',
      data: productos
    });
  } catch (error) {
    console.error('Error obteniendo productos por rango de precios:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

module.exports = router; 
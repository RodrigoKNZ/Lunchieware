const express = require('express');
const clientesModel = require('../models/clientes');
const contratosModel = require('../models/contratos');
const usuariosModel = require('../models/usuarios');
const pool = require('../db');

const router = express.Router();

// Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const clientes = await clientesModel.obtenerTodos();
    res.json({
      message: 'Clientes obtenidos exitosamente',
      data: clientes
    });
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await clientesModel.obtenerPorId(id);
    
    if (!cliente) {
      return res.status(404).json({ 
        message: 'Cliente no encontrado' 
      });
    }

    res.json({
      message: 'Cliente obtenido exitosamente',
      data: cliente
    });
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener cliente por usuario (código de cliente)
router.get('/usuario/:nombreUsuario', async (req, res) => {
  try {
    const { nombreUsuario } = req.params;
    const clientes = await clientesModel.obtenerPorUsuario(nombreUsuario);
    
    res.json({
      message: 'Cliente obtenido exitosamente',
      data: clientes
    });
  } catch (error) {
    console.error('Error obteniendo cliente por usuario:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Buscar clientes por nombre
router.get('/buscar/:nombre', async (req, res) => {
  try {
    const { nombre } = req.params;
    const clientes = await clientesModel.buscarPorNombre(nombre);
    
    res.json({
      message: 'Búsqueda completada',
      data: clientes
    });
  } catch (error) {
    console.error('Error buscando clientes:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener clientes por nivel y grado
router.get('/nivel/:nivel/grado/:grado', async (req, res) => {
  try {
    const { nivel, grado } = req.params;
    const clientes = await clientesModel.obtenerPorNivelGrado(nivel, grado);
    
    res.json({
      message: 'Clientes obtenidos exitosamente',
      data: clientes
    });
  } catch (error) {
    console.error('Error obteniendo clientes por nivel/grado:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener clientes vigentes
router.get('/vigentes/todos', async (req, res) => {
  try {
    const clientes = await clientesModel.obtenerVigentes();
    res.json({
      message: 'Clientes vigentes obtenidos exitosamente',
      data: clientes
    });
  } catch (error) {
    console.error('Error obteniendo clientes vigentes:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Crear nuevo cliente
router.post('/', async (req, res) => {
  try {
    const {
      codigoCliente,
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      nivel,
      grado,
      seccion,
      telefono1,
      telefono2,
      tipoDocumento,
      numDocumento,
      tipoCliente,
      clienteVigente,
      activo
    } = req.body;

    if (!codigoCliente || !nombres || !apellidoPaterno || !telefono1 || !tipoDocumento || !numDocumento || !tipoCliente) {
      return res.status(400).json({ 
        message: 'Los campos código, nombres, apellido paterno, teléfono, tipo documento, número documento y tipo cliente son requeridos' 
      });
    }

    // Verificar si ya existe un cliente con ese código
    const clienteExistente = await clientesModel.obtenerPorCodigo(codigoCliente);
    if (clienteExistente) {
      return res.status(400).json({ 
        message: 'Ya existe un cliente con ese código' 
      });
    }

    const nuevoCliente = await clientesModel.crear({
      codigoCliente,
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      nivel,
      grado,
      seccion,
      telefono1,
      telefono2,
      tipoDocumento,
      numDocumento,
      tipoCliente,
      clienteVigente,
      activo
    });

    // Crear usuario asociado automáticamente
    await usuariosModel.crear({
      nombreUsuario: codigoCliente,
      password: numDocumento,
      rol: 'cliente',
      accesoRealizado: false,
      activo: true
    });

    // Crear contrato para el año actual usando el modelo formal
    const hoy = new Date();
    const year = hoy.getFullYear();
    const fechaInicio = `${year}-01-01`;
    const fechaFin = `${year}-12-31`;
    const fechaCreacion = hoy.toISOString().slice(0,10);
    await contratosModel.crear({
      idCliente: nuevoCliente.idCliente,
      fechaInicioVigencia: fechaInicio,
      fechaFinVigencia: fechaFin,
      fechaCreacion: fechaCreacion
    });

    res.status(201).json({
      message: 'Cliente creado exitosamente',
      data: nuevoCliente
    });
  } catch (error) {
    console.error('Error creando cliente:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Actualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    const clienteExistente = await clientesModel.obtenerPorId(id);
    if (!clienteExistente) {
      return res.status(404).json({ 
        message: 'Cliente no encontrado' 
      });
    }

    const clienteActualizado = await clientesModel.actualizar(id, datos);

    res.json({
      message: 'Cliente actualizado exitosamente',
      data: clienteActualizado
    });
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Eliminar cliente (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const clienteExistente = await clientesModel.obtenerPorId(id);
    if (!clienteExistente) {
      return res.status(404).json({ 
        message: 'Cliente no encontrado' 
      });
    }

    await clientesModel.eliminar(id);

    res.json({
      message: 'Cliente eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener estadísticas de clientes
router.get('/estadisticas/totales', async (req, res) => {
  try {
    const estadisticas = await clientesModel.obtenerEstadisticas();
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

// Carga/actualización masiva de clientes
router.post('/masivo', async (req, res) => {
  try {
    const clientes = req.body;
    if (!Array.isArray(clientes) || clientes.length === 0) {
      return res.status(400).json({ message: 'Se requiere un array de clientes' });
    }
    const resultados = [];
    const hoy = new Date();
    const year = hoy.getFullYear();
    const fechaInicio = `${year}-01-01`;
    const fechaFin = `${year}-12-31`;
    const fechaCreacion = hoy.toISOString().slice(0,10);
    for (const cli of clientes) {
      // Buscar cliente activo por código
      const existente = await clientesModel.obtenerPorCodigo(cli.codigoCliente);
      let cliente;
      if (existente) {
        // Actualizar datos
        await clientesModel.actualizar(existente.idCliente, { ...cli, clienteVigente: true, activo: true });
        cliente = await clientesModel.obtenerPorId(existente.idCliente);
        resultados.push({ codigoCliente: cli.codigoCliente, accion: 'actualizado' });
      } else {
        // Crear cliente
        cliente = await clientesModel.crear({ ...cli, clienteVigente: true, activo: true });
        resultados.push({ codigoCliente: cli.codigoCliente, accion: 'creado' });
        // Crear usuario asociado automáticamente
        await usuariosModel.crear({
          nombreUsuario: cli.codigoCliente,
          password: cli.numDocumento,
          rol: 'cliente',
          accesoRealizado: false,
          activo: true
        });
        // Crear contrato para el año actual usando el modelo formal
        await contratosModel.crear({
          idCliente: cliente.idCliente,
          fechaInicioVigencia: fechaInicio,
          fechaFinVigencia: fechaFin,
          fechaCreacion: fechaCreacion
        });
      }
    }
    res.json({ message: 'Carga masiva completada', resultados });
  } catch (error) {
    console.error('Error en carga masiva:', error);
    res.status(500).json({ message: 'Error interno en carga masiva', error: error.message });
  }
});

module.exports = router; 
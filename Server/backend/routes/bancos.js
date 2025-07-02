const express = require('express');
const bancosModel = require('../models/bancos');
const router = express.Router();

// Crear banco
router.post('/', async (req, res) => {
  try {
    const { nombreBanco, codigoBanco, siglas } = req.body;
    if (!nombreBanco || !codigoBanco || !siglas) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    const banco = await bancosModel.crear({ nombreBanco, codigoBanco, siglas });
    res.status(201).json({ message: 'Banco creado', data: banco });
  } catch (error) {
    res.status(500).json({ message: 'Error creando banco', error: error.message });
  }
});

// Listar bancos
router.get('/', async (req, res) => {
  try {
    const bancos = await bancosModel.listar();
    res.json({ message: 'Bancos obtenidos', data: bancos });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo bancos', error: error.message });
  }
});

// Editar banco
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreBanco, siglas } = req.body;
    if (!nombreBanco || !siglas) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    const banco = await bancosModel.editar(id, { nombreBanco, siglas });
    res.json({ message: 'Banco editado', data: banco });
  } catch (error) {
    res.status(500).json({ message: 'Error editando banco', error: error.message });
  }
});

// Eliminar banco (borrado lógico)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const banco = await bancosModel.eliminar(id);
    res.json({ message: 'Banco eliminado', data: banco });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando banco', error: error.message });
  }
});

module.exports = router; 
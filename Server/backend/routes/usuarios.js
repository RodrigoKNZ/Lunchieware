const express = require('express');
const router = express.Router();
const usuariosModel = require('../models/usuarios');

router.post('/', async (req, res) => {
  try {
    const { nombreUsuario, password } = req.body;
    const nuevoUsuario = await usuariosModel.create({ nombreUsuario, password });
    res.status(201).json({ nombreUsuario: nuevoUsuario.nombreUsuario, rol: nuevoUsuario.rol, activo: nuevoUsuario.activo });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 
const express = require('express');
const jwt = require('jsonwebtoken');
const usuariosModel = require('../models/usuarios');

const router = express.Router();

// Middleware para generar token JWT
const generarToken = (usuario) => {
  return jwt.sign(
    { 
      id: usuario.idUsuario, 
      nombreUsuario: usuario.nombreUsuario, 
      rol: usuario.rol 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Login
router.post('/login', async (req, res) => {
  try {
    const { nombreUsuario, password } = req.body;

    if (!nombreUsuario || !password) {
      return res.status(400).json({ 
        message: 'Usuario y contraseña son requeridos' 
      });
    }

    const usuario = await usuariosModel.verificarCredenciales(nombreUsuario, password);
    
    if (!usuario) {
      return res.status(401).json({ 
        message: 'Credenciales incorrectas' 
      });
    }

    // Marcar acceso realizado
    await usuariosModel.marcarAcceso(usuario.idUsuario);

    const token = generarToken(usuario);

    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario.idUsuario,
        nombreUsuario: usuario.nombreUsuario,
        rol: usuario.rol,
        accesoRealizado: usuario.accesoRealizado
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Registro
router.post('/registro', async (req, res) => {
  try {
    const { nombreUsuario, password, rol } = req.body;

    if (!nombreUsuario || !password || !rol) {
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos' 
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await usuariosModel.buscarPorUsuario(nombreUsuario);
    if (usuarioExistente) {
      return res.status(400).json({ 
        message: 'El nombre de usuario ya existe' 
      });
    }

    const nuevoUsuario = await usuariosModel.crear({
      nombreUsuario,
      password,
      rol
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario: {
        id: nuevoUsuario.idUsuario,
        nombreUsuario: nuevoUsuario.nombreUsuario,
        rol: nuevoUsuario.rol
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor' 
    });
  }
});

// Verificar token
router.get('/verificar', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Token no proporcionado' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await usuariosModel.buscarPorId(decoded.id);
    
    if (!usuario) {
      return res.status(401).json({ 
        message: 'Usuario no encontrado' 
      });
    }

    res.json({
      message: 'Token válido',
      usuario: {
        id: usuario.idUsuario,
        nombreUsuario: usuario.nombreUsuario,
        rol: usuario.rol,
        accesoRealizado: usuario.accesoRealizado
      }
    });

  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(401).json({ 
      message: 'Token inválido' 
    });
  }
});

// Cambiar contraseña (y marcar acceso realizado)
router.post('/cambiar-password', async (req, res) => {
  try {
    const { idUsuario, nuevaPassword } = req.body;
    if (!idUsuario || !nuevaPassword) {
      return res.status(400).json({ message: 'idUsuario y nuevaPassword son requeridos' });
    }
    await usuariosModel.cambiarPassword(idUsuario, nuevaPassword);
    await usuariosModel.marcarAcceso(idUsuario);
    res.json({ message: 'Contraseña cambiada exitosamente' });
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ message: 'Error cambiando contraseña', error: error.message });
  }
});

module.exports = router; 
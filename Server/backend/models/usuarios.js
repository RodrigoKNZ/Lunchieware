const pool = require('../db');
const bcrypt = require('bcryptjs');

const usuariosModel = {
  // Crear un nuevo usuario
  async crear(datos) {
    const {
      nombreUsuario,
      contraseña,
      rol,
      accesoRealizado = false,
      activo = true
    } = datos;

    const hashedPassword = await bcrypt.hash(contraseña, 10);
    
    const query = `
      INSERT INTO "Usuario" ("nombreUsuario", "contraseña", "rol", "accesoRealizado", "activo")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING "idUsuario", "nombreUsuario", "rol", "accesoRealizado", "activo"
    `;
    const values = [nombreUsuario, hashedPassword, rol, accesoRealizado, activo];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Buscar usuario por nombre de usuario
  async buscarPorUsuario(nombreUsuario) {
    const query = 'SELECT * FROM "Usuario" WHERE "nombreUsuario" = $1 AND "activo" = true';
    const result = await pool.query(query, [nombreUsuario]);
    return result.rows[0];
  },

  // Buscar usuario por ID
  async buscarPorId(idUsuario) {
    const query = 'SELECT "idUsuario", "nombreUsuario", "rol", "accesoRealizado", "activo" FROM "Usuario" WHERE "idUsuario" = $1 AND "activo" = true';
    const result = await pool.query(query, [idUsuario]);
    return result.rows[0];
  },

  // Verificar credenciales
  async verificarCredenciales(nombreUsuario, contraseña) {
    const user = await this.buscarPorUsuario(nombreUsuario);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(contraseña, user.contraseña);
    return isValid ? user : null;
  },

  // Obtener todos los usuarios
  async obtenerTodos() {
    const query = 'SELECT "idUsuario", "nombreUsuario", "rol", "accesoRealizado", "activo" FROM "Usuario" WHERE "activo" = true ORDER BY "nombreUsuario"';
    const result = await pool.query(query);
    return result.rows;
  },

  // Actualizar usuario
  async actualizar(idUsuario, datos) {
    const {
      nombreUsuario,
      rol,
      accesoRealizado,
      activo
    } = datos;

    const query = `
      UPDATE "Usuario" 
      SET "nombreUsuario" = $1, "rol" = $2, "accesoRealizado" = $3, "activo" = $4
      WHERE "idUsuario" = $5
      RETURNING "idUsuario", "nombreUsuario", "rol", "accesoRealizado", "activo"
    `;
    const values = [nombreUsuario, rol, accesoRealizado, activo, idUsuario];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Cambiar contraseña
  async cambiarContraseña(idUsuario, nuevaContraseña) {
    const hashedPassword = await bcrypt.hash(nuevaContraseña, 10);
    const query = `
      UPDATE "Usuario" 
      SET "contraseña" = $1
      WHERE "idUsuario" = $2
      RETURNING "idUsuario", "nombreUsuario", "rol"
    `;
    const result = await pool.query(query, [hashedPassword, idUsuario]);
    return result.rows[0];
  },

  // Marcar acceso realizado
  async marcarAcceso(idUsuario) {
    const query = `
      UPDATE "Usuario" 
      SET "accesoRealizado" = true
      WHERE "idUsuario" = $1
      RETURNING "idUsuario", "nombreUsuario", "accesoRealizado"
    `;
    const result = await pool.query(query, [idUsuario]);
    return result.rows[0];
  },

  // Eliminar usuario (soft delete)
  async eliminar(idUsuario) {
    const query = 'UPDATE "Usuario" SET "activo" = false WHERE "idUsuario" = $1 RETURNING "idUsuario"';
    const result = await pool.query(query, [idUsuario]);
    return result.rows[0];
  },

  // Obtener usuarios por rol
  async obtenerPorRol(rol) {
    const query = `
      SELECT "idUsuario", "nombreUsuario", "rol", "accesoRealizado", "activo" 
      FROM "Usuario" 
      WHERE "rol" = $1 AND "activo" = true 
      ORDER BY "nombreUsuario"
    `;
    const result = await pool.query(query, [rol]);
    return result.rows;
  }
};

module.exports = usuariosModel; 
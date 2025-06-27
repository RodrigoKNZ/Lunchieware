const pool = require('../db');

const clientesModel = {
  // Obtener todos los clientes
  async obtenerTodos() {
    const query = 'SELECT * FROM "Cliente" WHERE "activo" = true ORDER BY "nombres", "apellidoPaterno"';
    const result = await pool.query(query);
    return result.rows;
  },

  // Obtener cliente por ID
  async obtenerPorId(idCliente) {
    const query = 'SELECT * FROM "Cliente" WHERE "idCliente" = $1 AND "activo" = true';
    const result = await pool.query(query, [idCliente]);
    return result.rows[0];
  },

  // Obtener cliente por código
  async obtenerPorCodigo(codigoCliente) {
    const query = 'SELECT * FROM "Cliente" WHERE "codigoCliente" = $1 AND "activo" = true';
    const result = await pool.query(query, [codigoCliente]);
    return result.rows[0];
  },

  // Obtener cliente por nombre de usuario (que coincide con código de cliente)
  async obtenerPorUsuario(nombreUsuario) {
    const query = 'SELECT * FROM "Cliente" WHERE "codigoCliente" = $1 AND "activo" = true';
    const result = await pool.query(query, [nombreUsuario]);
    return result.rows;
  },

  // Buscar clientes por nombre
  async buscarPorNombre(nombre) {
    const query = `
      SELECT * FROM "Cliente" 
      WHERE ("nombres" ILIKE $1 OR "apellidoPaterno" ILIKE $1 OR "apellidoMaterno" ILIKE $1) 
      AND "activo" = true 
      ORDER BY "nombres", "apellidoPaterno"
    `;
    const result = await pool.query(query, [`%${nombre}%`]);
    return result.rows;
  },

  // Obtener clientes por nivel y grado
  async obtenerPorNivelGrado(nivel, grado) {
    const query = `
      SELECT * FROM "Cliente" 
      WHERE "nivel" = $1 AND "grado" = $2 AND "activo" = true 
      ORDER BY "seccion", "apellidoPaterno", "apellidoMaterno"
    `;
    const result = await pool.query(query, [nivel, grado]);
    return result.rows;
  },

  // Obtener clientes vigentes
  async obtenerVigentes() {
    const query = 'SELECT * FROM "Cliente" WHERE "clienteVigente" = true AND "activo" = true ORDER BY "nombres"';
    const result = await pool.query(query);
    return result.rows;
  },

  // Crear nuevo cliente
  async crear(datos) {
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
      clienteVigente = true,
      activo = true
    } = datos;

    const query = `
      INSERT INTO "Cliente" (
        "codigoCliente", "nombres", "apellidoPaterno", "apellidoMaterno", 
        "nivel", "grado", "seccion", "telefono1", "telefono2", 
        "tipoDocumento", "numDocumento", "tipoCliente", "clienteVigente", "activo"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    const values = [
      codigoCliente, nombres, apellidoPaterno, apellidoMaterno,
      nivel, grado, seccion, telefono1, telefono2,
      tipoDocumento, numDocumento, tipoCliente, clienteVigente, activo
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Actualizar cliente
  async actualizar(idCliente, datos) {
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
    } = datos;

    const query = `
      UPDATE "Cliente"
      SET "codigoCliente" = $1, "nombres" = $2, "apellidoPaterno" = $3, "apellidoMaterno" = $4,
          "nivel" = $5, "grado" = $6, "seccion" = $7, "telefono1" = $8, "telefono2" = $9,
          "tipoDocumento" = $10, "numDocumento" = $11, "tipoCliente" = $12, 
          "clienteVigente" = $13, "activo" = $14
      WHERE "idCliente" = $15
      RETURNING *
    `;
    const values = [
      codigoCliente, nombres, apellidoPaterno, apellidoMaterno,
      nivel, grado, seccion, telefono1, telefono2,
      tipoDocumento, numDocumento, tipoCliente, clienteVigente, activo, idCliente
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Eliminar cliente (soft delete)
  async eliminar(idCliente) {
    const query = 'UPDATE "Cliente" SET "activo" = false WHERE "idCliente" = $1 RETURNING *';
    const result = await pool.query(query, [idCliente]);
    return result.rows[0];
  },

  // Obtener estadísticas de clientes
  async obtenerEstadisticas() {
    const query = `
      SELECT 
        COUNT(*) as total_clientes,
        COUNT(CASE WHEN "clienteVigente" = true THEN 1 END) as clientes_vigentes,
        COUNT(CASE WHEN "clienteVigente" = false THEN 1 END) as clientes_no_vigentes
      FROM "Cliente" 
      WHERE "activo" = true
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
};

module.exports = clientesModel; 
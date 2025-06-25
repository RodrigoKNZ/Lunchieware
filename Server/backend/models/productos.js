const pool = require('../db');

const productosModel = {
  // Obtener todos los productos
  async obtenerTodos() {
    const query = 'SELECT * FROM "Producto" WHERE "activo" = true ORDER BY "nombreProducto"';
    const result = await pool.query(query);
    return result.rows;
  },

  // Obtener producto por ID
  async obtenerPorId(idProducto) {
    const query = 'SELECT * FROM "Producto" WHERE "idProducto" = $1 AND "activo" = true';
    const result = await pool.query(query, [idProducto]);
    return result.rows[0];
  },

  // Obtener producto por código
  async obtenerPorCodigo(codigoProducto) {
    const query = 'SELECT * FROM "Producto" WHERE "codigoProducto" = $1 AND "activo" = true';
    const result = await pool.query(query, [codigoProducto]);
    return result.rows[0];
  },

  // Buscar productos por nombre
  async buscarPorNombre(nombre) {
    const query = `
      SELECT * FROM "Producto" 
      WHERE ("nombreProducto" ILIKE $1 OR "nombreCorto" ILIKE $1) 
      AND "activo" = true 
      ORDER BY "nombreProducto"
    `;
    const result = await pool.query(query, [`%${nombre}%`]);
    return result.rows;
  },

  // Obtener productos por tipo
  async obtenerPorTipo(tipoProducto) {
    const query = `
      SELECT * FROM "Producto" 
      WHERE "tipoProducto" = $1 AND "activo" = true 
      ORDER BY "nombreProducto"
    `;
    const result = await pool.query(query, [tipoProducto]);
    return result.rows;
  },

  // Obtener productos disponibles
  async obtenerDisponibles() {
    const query = 'SELECT * FROM "Producto" WHERE "disponible" = true AND "activo" = true ORDER BY "nombreProducto"';
    const result = await pool.query(query);
    return result.rows;
  },

  // Obtener productos afectos a IGV
  async obtenerAfectosIGV() {
    const query = 'SELECT * FROM "Producto" WHERE "afectoIGV" = true AND "activo" = true ORDER BY "nombreProducto"';
    const result = await pool.query(query);
    return result.rows;
  },

  // Crear nuevo producto
  async crear(datos) {
    const {
      codigoProducto,
      nombreProducto,
      nombreCorto,
      tipoProducto,
      costoUnitario,
      afectoIGV,
      disponible,
      activo = true
    } = datos;

    const query = `
      INSERT INTO "Producto" (
        "codigoProducto", "nombreProducto", "nombreCorto", "tipoProducto", 
        "costoUnitario", "afectoIGV", "disponible", "activo"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      codigoProducto, nombreProducto, nombreCorto, tipoProducto,
      costoUnitario, afectoIGV, disponible, activo
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Actualizar producto
  async actualizar(idProducto, datos) {
    const {
      codigoProducto,
      nombreProducto,
      nombreCorto,
      tipoProducto,
      costoUnitario,
      afectoIGV,
      disponible,
      activo
    } = datos;

    const query = `
      UPDATE "Producto"
      SET "codigoProducto" = $1, "nombreProducto" = $2, "nombreCorto" = $3, "tipoProducto" = $4,
          "costoUnitario" = $5, "afectoIGV" = $6, "disponible" = $7, "activo" = $8
      WHERE "idProducto" = $9
      RETURNING *
    `;
    const values = [
      codigoProducto, nombreProducto, nombreCorto, tipoProducto,
      costoUnitario, afectoIGV, disponible, activo, idProducto
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Cambiar disponibilidad del producto
  async cambiarDisponibilidad(idProducto, disponible) {
    const query = `
      UPDATE "Producto" 
      SET "disponible" = $1
      WHERE "idProducto" = $2
      RETURNING *
    `;
    const result = await pool.query(query, [disponible, idProducto]);
    return result.rows[0];
  },

  // Eliminar producto (soft delete)
  async eliminar(idProducto) {
    const query = 'UPDATE "Producto" SET "activo" = false WHERE "idProducto" = $1 RETURNING *';
    const result = await pool.query(query, [idProducto]);
    return result.rows[0];
  },

  // Obtener estadísticas de productos
  async obtenerEstadisticas() {
    const query = `
      SELECT 
        COUNT(*) as total_productos,
        COUNT(CASE WHEN "disponible" = true THEN 1 END) as productos_disponibles,
        COUNT(CASE WHEN "disponible" = false THEN 1 END) as productos_no_disponibles,
        COUNT(CASE WHEN "afectoIGV" = true THEN 1 END) as productos_afectos_igv,
        COUNT(CASE WHEN "afectoIGV" = false THEN 1 END) as productos_no_afectos_igv
      FROM "Producto" 
      WHERE "activo" = true
    `;
    const result = await pool.query(query);
    return result.rows[0];
  },

  // Obtener productos por rango de precios
  async obtenerPorRangoPrecios(precioMin, precioMax) {
    const query = `
      SELECT * FROM "Producto" 
      WHERE "costoUnitario" BETWEEN $1 AND $2 AND "activo" = true 
      ORDER BY "costoUnitario"
    `;
    const result = await pool.query(query, [precioMin, precioMax]);
    return result.rows;
  }
};

module.exports = productosModel; 
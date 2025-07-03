const pool = require('../db');

const bancosModel = {
  async crear({ nombreBanco, codigoBanco, siglas }) {
    // Paso 1: Insertar con código temporal '0000'
    const insertQuery = `
      INSERT INTO "Banco" ("nombreBanco", "codigoBanco", "siglas", "disponible", "activo")
      VALUES ($1, '0000', $2, true, true)
      RETURNING *
    `;
    const insertResult = await pool.query(insertQuery, [nombreBanco, siglas]);
    const banco = insertResult.rows[0];
    // Paso 2: Actualizar el código con el idBanco formateado
    const codigoFinal = banco.idBanco.toString().padStart(4, '0');
    const updateQuery = `
      UPDATE "Banco" SET "codigoBanco" = $1 WHERE "idBanco" = $2 RETURNING *
    `;
    const updateResult = await pool.query(updateQuery, [codigoFinal, banco.idBanco]);
    return updateResult.rows[0];
  },
  async listar() {
    const query = `SELECT * FROM "Banco" WHERE "activo" = true ORDER BY "nombreBanco" ASC`;
    const result = await pool.query(query);
    return result.rows;
  },
  async editar(idBanco, { nombreBanco, siglas, disponible }) {
    const query = `
      UPDATE "Banco"
      SET "nombreBanco" = $1, "siglas" = $2, "disponible" = $3
      WHERE "idBanco" = $4
      RETURNING *
    `;
    const result = await pool.query(query, [nombreBanco, siglas, disponible, idBanco]);
    return result.rows[0];
  },
  async eliminar(idBanco) {
    const query = `
      UPDATE "Banco" SET "activo" = false WHERE "idBanco" = $1 RETURNING *
    `;
    const result = await pool.query(query, [idBanco]);
    return result.rows[0];
  }
};

module.exports = bancosModel; 
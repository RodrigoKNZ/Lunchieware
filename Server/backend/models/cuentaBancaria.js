const pool = require('../db');

const cuentaBancariaModel = {
  async crear({ idBanco, codigoCuenta, codigoAgencia, tipoCuenta, disponible }) {
    const insertQuery = `
      INSERT INTO "CuentaBancaria" ("idBanco", "codigoCuenta", "codigoAgencia", "tipoCuenta", "disponible", "activo")
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING *
    `;
    const insertResult = await pool.query(insertQuery, [idBanco, codigoCuenta, codigoAgencia, tipoCuenta, disponible]);
    return insertResult.rows[0];
  },
  async listarPorBanco(idBanco) {
    const query = `SELECT * FROM "CuentaBancaria" WHERE "idBanco" = $1 AND "activo" = true ORDER BY "codigoCuenta" ASC`;
    const result = await pool.query(query, [idBanco]);
    return result.rows;
  },
  async listarTodas() {
    const query = `
      SELECT 
        cb."idCuenta",
        cb."codigoCuenta",
        cb."codigoAgencia",
        cb."tipoCuenta",
        cb."disponible",
        b."idBanco",
        b."nombreBanco",
        b."siglas"
      FROM "CuentaBancaria" cb
      JOIN "Banco" b ON cb."idBanco" = b."idBanco"
      WHERE cb."activo" = true AND b."activo" = true
      ORDER BY b."nombreBanco" ASC, cb."codigoCuenta" ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  },
  async editar(idCuenta, { codigoCuenta, codigoAgencia, tipoCuenta, disponible }) {
    const query = `
      UPDATE "CuentaBancaria"
      SET "codigoCuenta" = $1, "codigoAgencia" = $2, "tipoCuenta" = $3, "disponible" = $4
      WHERE "idCuenta" = $5
      RETURNING *
    `;
    const result = await pool.query(query, [codigoCuenta, codigoAgencia, tipoCuenta, disponible, idCuenta]);
    return result.rows[0];
  },
  async eliminar(idCuenta) {
    const query = `
      UPDATE "CuentaBancaria" SET "activo" = false WHERE "idCuenta" = $1 RETURNING *
    `;
    const result = await pool.query(query, [idCuenta]);
    return result.rows[0];
  }
};

module.exports = cuentaBancariaModel; 
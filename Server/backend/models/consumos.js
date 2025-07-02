const pool = require('../db');

const consumosModel = {
  async obtenerPorContrato(idContrato) {
    const query = 'SELECT * FROM "Consumo" WHERE "idContrato" = $1 AND "activo" = true ORDER BY "fechaConsumo" DESC';
    const result = await pool.query(query, [idContrato]);
    return result.rows;
  },
  async obtenerPorId(idConsumo) {
    const query = 'SELECT * FROM "Consumo" WHERE "idConsumo" = $1';
    const result = await pool.query(query, [idConsumo]);
    return result.rows[0];
  }
};

module.exports = consumosModel; 
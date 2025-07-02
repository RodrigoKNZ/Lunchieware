-- Script para crear todas las tablas de la base de datos lunchieware
-- Ejecutar este script en pgAdmin o en la terminal de PostgreSQL

-- Conectar a la base de datos lunchieware
\c lunchieware;

-- Crear tabla ProgramacionMenu
CREATE TABLE IF NOT EXISTS "ProgramacionMenu" (
  "idMenu" SERIAL PRIMARY KEY,
  "fecha" DATE NOT NULL,
  "entrada" VARCHAR(100) NOT NULL,
  "plato" VARCHAR(100) NOT NULL,
  "platoALaCarta" VARCHAR(100) NULL,
  "postre" VARCHAR(100) NOT NULL,
  "refresco" VARCHAR(100) NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT true
);

-- Crear índice único en fecha para ProgramacionMenu
CREATE UNIQUE INDEX IF NOT EXISTS idx_programacion_menu_fecha ON "ProgramacionMenu" ("fecha");

-- Crear tabla Cliente
CREATE TABLE IF NOT EXISTS "Cliente" (
  "idCliente" SERIAL PRIMARY KEY,
  "codigoCliente" VARCHAR(30) NOT NULL,
  "nombres" VARCHAR(100) NOT NULL,
  "apellidoPaterno" VARCHAR(100) NOT NULL,
  "apellidoMaterno" VARCHAR(100) NOT NULL,
  "nivel" CHAR(2) NULL,
  "grado" CHAR(3) NULL,
  "seccion" CHAR(1) NULL,
  "telefono1" VARCHAR(20) NOT NULL,
  "telefono2" VARCHAR(20) NULL,
  "tipoDocumento" VARCHAR(5) NOT NULL,
  "numDocumento" VARCHAR(20) NOT NULL,
  "tipoCliente" CHAR(1) NOT NULL,
  "clienteVigente" BOOLEAN NOT NULL DEFAULT true,
  "activo" BOOLEAN NOT NULL DEFAULT true
);

-- Crear índice único en codigoCliente para Cliente
CREATE UNIQUE INDEX IF NOT EXISTS idx_cliente_codigo ON "Cliente" ("codigoCliente");

-- Crear tabla Contrato
CREATE TABLE IF NOT EXISTS "Contrato" (
  "idContrato" SERIAL PRIMARY KEY,
  "codigoContrato" VARCHAR(30) NOT NULL,
  "idCliente" INTEGER NOT NULL,
  "fechaInicioVigencia" DATE NOT NULL,
  "fechaFinVigencia" DATE NOT NULL,
  "fechaCreacion" DATE NOT NULL,
  "importeAbonos" NUMERIC(10,2) NOT NULL DEFAULT 0,
  "importeConsumos" NUMERIC(10,2) NOT NULL DEFAULT 0,
  "importeSaldo" NUMERIC(10,2) NOT NULL DEFAULT 0,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "FK_Contrato_Cliente" FOREIGN KEY ("idCliente") REFERENCES "Cliente"("idCliente")
);

-- Crear índice único en codigoContrato para Contrato
CREATE UNIQUE INDEX IF NOT EXISTS idx_contrato_codigo ON "Contrato" ("codigoContrato");

-- Crear tabla Consumo
CREATE TABLE IF NOT EXISTS "Consumo" (
  "idConsumo" SERIAL PRIMARY KEY,
  "fechaConsumo" DATE NOT NULL,
  "idContrato" INTEGER NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "FK_Consumo_Contrato" FOREIGN KEY ("idContrato") REFERENCES "Contrato"("idContrato")
);

-- Crear tabla ComprobanteVenta
CREATE TABLE IF NOT EXISTS "ComprobanteVenta" (
  "idComprobante" SERIAL PRIMARY KEY,
  "tipoComprobante" CHAR(1) NOT NULL,
  "numeroSerie" VARCHAR(20) NOT NULL,
  "numeroComprobante" VARCHAR(20) NOT NULL,
  "fechaDocumento" DATE NOT NULL,
  "idContrato" INTEGER NOT NULL,
  "formaDePago" VARCHAR(20) NOT NULL,
  "medioDePago" VARCHAR(20) NOT NULL,
  "importeImponible" NUMERIC(10,2) NOT NULL,
  "importeImpuesto" NUMERIC(10,2) NOT NULL,
  "importeTotal" NUMERIC(10,2) NOT NULL,
  "saldoAlMomentoDeVenta" NUMERIC(10,2) NOT NULL,
  "idConsumo" INTEGER NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "FK_ComprobanteVenta_Contrato" FOREIGN KEY ("idContrato") REFERENCES "Contrato"("idContrato"),
  CONSTRAINT "FK_ComprobanteVenta_Consumo" FOREIGN KEY ("idConsumo") REFERENCES "Consumo"("idConsumo")
);

-- Crear tabla Producto (ya existe, pero la incluimos para completitud)
CREATE TABLE IF NOT EXISTS "Producto" (
  "idProducto" SERIAL PRIMARY KEY,
  "codigoProducto" VARCHAR(30) NOT NULL,
  "nombreProducto" VARCHAR(255) NOT NULL,
  "nombreCorto" VARCHAR(20) NOT NULL,
  "tipoProducto" CHAR(1) NOT NULL,
  "costoUnitario" NUMERIC(10,2) NOT NULL,
  "afectoIGV" BOOLEAN NOT NULL DEFAULT true,
  "disponible" BOOLEAN NOT NULL DEFAULT true,
  "activo" BOOLEAN NOT NULL DEFAULT true
);

-- Crear índice normal en codigoProducto para Producto
CREATE INDEX IF NOT EXISTS idx_producto_codigo ON "Producto" ("codigoProducto");

-- Crear tabla FilaDetalleComprobante
CREATE TABLE IF NOT EXISTS "FilaDetalleComprobante" (
  "idComprobante" INTEGER NOT NULL,
  "idFila" INTEGER NOT NULL,
  "idProducto" INTEGER NOT NULL,
  "cantidad" INTEGER NOT NULL,
  "importeTotal" NUMERIC(10,2) NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY ("idComprobante", "idFila"),
  CONSTRAINT "FK_FilaDetalleComprobante_Comprobante" FOREIGN KEY ("idComprobante") REFERENCES "ComprobanteVenta"("idComprobante"),
  CONSTRAINT "FK_FilaDetalleComprobante_Producto" FOREIGN KEY ("idProducto") REFERENCES "Producto"("idProducto")
);

-- Crear tabla Usuario
CREATE TABLE IF NOT EXISTS "Usuario" (
  "idUsuario" SERIAL PRIMARY KEY,
  "nombreUsuario" VARCHAR(100) NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "accesoRealizado" BOOLEAN NOT NULL DEFAULT false,
  "rol" VARCHAR(50) NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT true
);

-- Crear índice único en nombreUsuario para Usuario
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuario_nombre ON "Usuario" ("nombreUsuario");

-- Crear tabla Abono
CREATE TABLE IF NOT EXISTS "Abono" (
  "idAbono" SERIAL PRIMARY KEY,
  "idContrato" INTEGER NOT NULL,
  "fechaAbono" DATE NOT NULL,
  "idCuenta" INTEGER NOT NULL,
  "numRecibo" VARCHAR(20) NOT NULL,
  "importeAbono" NUMERIC(10,2) NOT NULL,
  "registroManual" BOOLEAN NOT NULL DEFAULT false,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "FK_Abono_Contrato" FOREIGN KEY ("idContrato") REFERENCES "Contrato"("idContrato")
);

-- Crear tabla Banco
CREATE TABLE IF NOT EXISTS "Banco" (
  "idBanco" SERIAL PRIMARY KEY,
  "codigoBanco" VARCHAR(30) NOT NULL,
  "nombreBanco" VARCHAR(100) NOT NULL,
  "siglas" VARCHAR(10) NOT NULL,
  "disponible" BOOLEAN NOT NULL DEFAULT true,
  "activo" BOOLEAN NOT NULL DEFAULT true
);

-- Crear tabla CuentaBancaria
CREATE TABLE IF NOT EXISTS "CuentaBancaria" (
  "idCuenta" SERIAL PRIMARY KEY,
  "idBanco" INTEGER NOT NULL,
  "codigoCuenta" VARCHAR(30) NOT NULL,
  "codigoAgencia" VARCHAR(10) NULL,
  "tipoCuenta" VARCHAR(20) NOT NULL,
  "disponible" BOOLEAN NOT NULL DEFAULT true,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "FK_CuentaBancaria_Banco" FOREIGN KEY ("idBanco") REFERENCES "Banco"("idBanco")
);

-- Crear tabla Devolucion
CREATE TABLE IF NOT EXISTS "Devolucion" (
  "idDevolucion" SERIAL PRIMARY KEY,
  "idContrato" INTEGER NOT NULL,
  "fechaDevolucion" DATE NOT NULL,
  "idCuenta" INTEGER NOT NULL,
  "numRecibo" VARCHAR(20) NOT NULL,
  "importeDevolución" NUMERIC(10,2) NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "FK_Devolucion_Contrato" FOREIGN KEY ("idContrato") REFERENCES "Contrato"("idContrato"),
  CONSTRAINT "FK_Devolucion_CuentaBancaria" FOREIGN KEY ("idCuenta") REFERENCES "CuentaBancaria"("idCuenta")
);

-- Crear tabla CajaChica
CREATE TABLE IF NOT EXISTS "CajaChica" (
  "idCajaChica" SERIAL PRIMARY KEY,
  "numeroLiquidacion" VARCHAR(30) NOT NULL,
  "fechaApertura" DATE NOT NULL,
  "saldoInicial" NUMERIC(10,2) NOT NULL,
  "saldoFinal" NUMERIC(10,2) NOT NULL,
  "observaciones" TEXT NULL,
  "abierta" BOOLEAN NOT NULL DEFAULT true,
  "fechaLiquidacion" DATE NULL,
  "activo" BOOLEAN NOT NULL DEFAULT true
);

-- Crear tabla MovimientoDeCajaChica
CREATE TABLE IF NOT EXISTS "MovimientoDeCajaChica" (
  "idMovimiento" SERIAL PRIMARY KEY,
  "idCajaChica" INTEGER NOT NULL,
  "tipoDocumento" CHAR(1) NOT NULL,
  "referencia" VARCHAR(50) NOT NULL,
  "serie" VARCHAR(20) NOT NULL,
  "numero" VARCHAR(20) NOT NULL,
  "fechaMovimiento" DATE NOT NULL,
  "montoImponible" NUMERIC(10,2) NOT NULL,
  "impuestos" NUMERIC(10,2) NOT NULL,
  "montoTotal" NUMERIC(10,2) NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "FK_MovimientoDeCajaChica_CajaChica" FOREIGN KEY ("idCajaChica") REFERENCES "CajaChica"("idCajaChica")
);

-- Crear tabla Queja
CREATE TABLE IF NOT EXISTS "Queja" (
  "idQueja" SERIAL PRIMARY KEY,
  "codigoQueja" VARCHAR(30) NULL,
  "titulo" VARCHAR(100) NOT NULL,
  "resuelta" BOOLEAN NOT NULL DEFAULT false,
  "detalle" TEXT NOT NULL,
  "fechaRegistro" DATE NOT NULL,
  "idCliente" INTEGER NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "FK_Queja_Cliente" FOREIGN KEY ("idCliente") REFERENCES "Cliente"("idCliente")
);

-- Crear índice único en codigoQueja para Queja
CREATE UNIQUE INDEX IF NOT EXISTS idx_queja_codigo ON "Queja" ("codigoQueja");

-- Crear tabla Sugerencia
CREATE TABLE IF NOT EXISTS "Sugerencia" (
  "idSugerencia" SERIAL PRIMARY KEY,
  "codigoSugerencia" VARCHAR(30) NULL,
  "titulo" VARCHAR(100) NOT NULL,
  "detalle" TEXT NOT NULL,
  "fechaRegistro" DATE NOT NULL,
  "idCliente" INTEGER NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "FK_Sugerencia_Cliente" FOREIGN KEY ("idCliente") REFERENCES "Cliente"("idCliente")
);

-- Crear índice único en codigoSugerencia para Sugerencia
CREATE UNIQUE INDEX IF NOT EXISTS idx_sugerencia_codigo ON "Sugerencia" ("codigoSugerencia");

-- Crear tabla NotaDeCredito
CREATE TABLE IF NOT EXISTS "NotaDeCredito" (
  "idNotaDeCredito" SERIAL PRIMARY KEY,
  "numeroSerie" VARCHAR(20) NOT NULL,
  "numeroDocumento" VARCHAR(20) NOT NULL,
  "motivo" TEXT NULL,
  "fechaDocumento" DATE NOT NULL,
  "idComprobante" INTEGER NOT NULL,
  "importeInafecto" NUMERIC(10,2) NOT NULL DEFAULT 0,
  "importeImponible" NUMERIC(10,2) NOT NULL,
  "importeImpuesto" NUMERIC(10,2) NOT NULL,
  "importeTotal" NUMERIC(10,2) NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "FK_NotaDeCredito_ComprobanteVenta" FOREIGN KEY ("idComprobante") REFERENCES "ComprobanteVenta"("idComprobante")
);

-- Verificar que todas las tablas se crearon correctamente
SELECT 'Todas las tablas creadas exitosamente' as mensaje;

-- Mostrar todas las tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name; 
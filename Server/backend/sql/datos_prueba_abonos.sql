-- Script para insertar datos de prueba de abonos
-- Ejecutar después de crear las tablas y tener al menos un cliente y contrato

-- Insertar bancos de prueba
INSERT INTO "Banco" ("codigoBanco", "nombreBanco", "siglas", "disponible", "activo") VALUES
('B001', 'Banco de Crédito del Perú', 'BCP', true, true),
('B002', 'Banco Interbank', 'Interbank', true, true),
('B003', 'Banco BBVA Perú', 'BBVA', true, true)
ON CONFLICT DO NOTHING;

-- Insertar cuentas bancarias de prueba
INSERT INTO "CuentaBancaria" ("idBanco", "codigoCuenta", "codigoAgencia", "tipoCuenta", "disponible", "activo") VALUES
(1, '123-4567890-0-12', '001', 'Corriente', true, true),
(2, '123-4567890-0-13', '002', 'Corriente', true, true),
(3, '123-4567890-0-14', '003', 'Corriente', true, true)
ON CONFLICT DO NOTHING;

-- Insertar abonos de prueba (asumiendo que existe un contrato con idContrato = 1)
-- Ajustar el idContrato según los datos reales de tu base de datos
INSERT INTO "Abono" ("idContrato", "fechaAbono", "idCuenta", "numRecibo", "importeAbono", "registroManual", "activo") VALUES
(1, '2025-04-20', 1, 'ABN001', 50.00, false, true),
(1, '2025-04-18', 1, 'ABN002', 30.00, false, true),
(1, '2025-04-15', 2, 'ABN003', 25.00, false, true),
(1, '2025-04-12', 1, 'ABN004', 40.00, false, true),
(1, '2025-04-10', 1, 'ABN005', 35.00, false, true),
(1, '2025-04-08', 2, 'ABN006', 45.00, false, true),
(1, '2025-04-05', 1, 'ABN007', 20.00, false, true),
(1, '2025-04-03', 1, 'ABN008', 55.00, false, true),
(1, '2025-04-01', 2, 'ABN009', 30.00, false, true),
(1, '2025-03-30', 1, 'ABN010', 40.00, false, true),
(1, '2025-03-28', 1, 'ABN011', 25.00, false, true),
(1, '2025-03-25', 2, 'ABN012', 35.00, false, true),
(1, '2025-03-22', 1, 'ABN013', 50.00, false, true)
ON CONFLICT DO NOTHING;

-- Actualizar el contrato con los totales de abonos
UPDATE "Contrato" 
SET "importeAbonos" = (
    SELECT COALESCE(SUM("importeAbono"), 0) 
    FROM "Abono" 
    WHERE "idContrato" = 1 AND "activo" = true
),
"importeSaldo" = (
    SELECT COALESCE(SUM("importeAbono"), 0) 
    FROM "Abono" 
    WHERE "idContrato" = 1 AND "activo" = true
) - COALESCE("importeConsumos", 0)
WHERE "idContrato" = 1; 
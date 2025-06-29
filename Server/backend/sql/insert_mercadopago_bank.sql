-- Script para insertar banco y cuenta bancaria para Mercado Pago
-- Esto permite registrar abonos online sin modificar la estructura de la tabla Abono

-- Insertar banco para Mercado Pago (solo si no existe)
INSERT INTO "Banco" ("codigoBanco", "nombreBanco", "siglas", "disponible", "activo") 
SELECT 'MP001', 'Mercado Pago', 'MP', true, true
WHERE NOT EXISTS (
    SELECT 1 FROM "Banco" WHERE "codigoBanco" = 'MP001'
);

-- Insertar cuenta bancaria para Mercado Pago (solo si no existe)
INSERT INTO "CuentaBancaria" ("idBanco", "codigoCuenta", "codigoAgencia", "tipoCuenta", "disponible", "activo")
SELECT 
    b."idBanco",
    'CUENTA-MP-001',
    'AG-MP',
    'Cuenta Corriente',
    true,
    true
FROM "Banco" b 
WHERE b."codigoBanco" = 'MP001'
AND NOT EXISTS (
    SELECT 1 FROM "CuentaBancaria" WHERE "codigoCuenta" = 'CUENTA-MP-001'
);

-- Verificar la inserción
SELECT 
    b."codigoBanco",
    b."nombreBanco",
    cb."codigoCuenta",
    cb."tipoCuenta"
FROM "Banco" b
JOIN "CuentaBancaria" cb ON b."idBanco" = cb."idBanco"
WHERE b."codigoBanco" = 'MP001';

-- Comentario: Ahora los abonos online se pueden registrar usando esta cuenta bancaria 
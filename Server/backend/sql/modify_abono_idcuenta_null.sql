-- Script para permitir valores nulos en idCuenta de la tabla Abono
-- Esto es necesario para los abonos realizados por pagos online (Mercado Pago)

-- Modificar la columna idCuenta para permitir valores nulos
ALTER TABLE "Abono" ALTER COLUMN "idCuenta" DROP NOT NULL;

-- Verificar el cambio
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'Abono' AND column_name = 'idCuenta';

-- Comentario: Ahora los abonos pueden registrarse sin una cuenta bancaria específica
-- (útil para pagos online como Mercado Pago) 
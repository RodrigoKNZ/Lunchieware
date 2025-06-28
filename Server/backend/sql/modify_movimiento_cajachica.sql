-- Script para modificar la columna tipoDocumento en MovimientoDeCajaChica
-- Ejecutar este script en pgAdmin o en la terminal de PostgreSQL

-- Conectar a la base de datos lunchieware
\c lunchieware;

-- Modificar la columna tipoDocumento para permitir textos más largos
ALTER TABLE "MovimientoDeCajaChica" 
ALTER COLUMN "tipoDocumento" TYPE VARCHAR(50);

-- Verificar el cambio
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'MovimientoDeCajaChica' 
AND column_name = 'tipoDocumento'; 
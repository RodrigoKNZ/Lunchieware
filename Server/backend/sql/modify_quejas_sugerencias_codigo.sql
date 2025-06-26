-- Script para modificar las tablas Queja y Sugerencia
-- Hacer que los campos codigoQueja y codigoSugerencia no sean obligatorios

-- Conectar a la base de datos lunchieware
\c lunchieware;

-- Modificar tabla Queja: hacer codigoQueja NULL
ALTER TABLE "Queja" ALTER COLUMN "codigoQueja" DROP NOT NULL;

-- Modificar tabla Sugerencia: hacer codigoSugerencia NULL (por si acaso no se hizo antes)
ALTER TABLE "Sugerencia" ALTER COLUMN "codigoSugerencia" DROP NOT NULL;

-- Verificar los cambios
SELECT 
    table_name, 
    column_name, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('Queja', 'Sugerencia') 
    AND column_name IN ('codigoQueja', 'codigoSugerencia')
ORDER BY table_name, column_name;

-- Mostrar mensaje de confirmación
SELECT 'Campos codigoQueja y codigoSugerencia modificados exitosamente' as mensaje; 
-- Script para verificar el estado de la base de datos lunchieware
-- Ejecutar este script en pgAdmin o en la terminal de PostgreSQL

-- Conectar a la base de datos lunchieware
\c lunchieware;

-- Mostrar todas las tablas existentes
\dt

-- Mostrar información detallada de las tablas
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar si existe la tabla Producto
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'Producto'
        ) 
        THEN 'La tabla Producto EXISTE'
        ELSE 'La tabla Producto NO EXISTE'
    END as estado_tabla_producto;

-- Si la tabla Producto existe, mostrar su estructura
\dt+ "Producto"

-- Mostrar las columnas de la tabla Producto (si existe)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Producto' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Mostrar el número de registros en la tabla Producto (si existe)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'Producto'
        ) 
        THEN (SELECT COUNT(*) FROM "Producto")
        ELSE 0
    END as total_registros_producto; 
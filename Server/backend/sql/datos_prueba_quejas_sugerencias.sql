-- Datos de prueba para Quejas y Sugerencias
-- Usando los IDs de usuario existentes en la base de datos

-- Limpiar datos existentes (opcional)
DELETE FROM "Queja" WHERE "codigoQueja" LIKE 'QJ%';
DELETE FROM "Sugerencia" WHERE "codigoSugerencia" LIKE 'SG%';

-- Insertar quejas de prueba
INSERT INTO "Queja" ("codigoQueja", "asunto", "detalle", "fechaCreacion", "idUsuario", "resuelto", "activo") VALUES
('QJ00001', 'Problema con el servicio de almuerzo', 'El almuerzo de ayer llegó frío y tardó más de lo esperado. Necesito que mejoren el servicio de entrega.', NOW() - INTERVAL '5 days', 9, false, true),
('QJ00002', 'Devolución de dinero por contrato cancelado', 'Cancelé mi contrato hace 2 semanas y aún no he recibido la devolución del dinero restante. Necesito que procesen mi solicitud.', NOW() - INTERVAL '3 days', 10, true, true),
('QJ00003', 'Problema con la calidad de los alimentos', 'Los últimos almuerzos han tenido una calidad inferior. La carne está muy dura y las verduras no están frescas.', NOW() - INTERVAL '1 day', 11, false, true),
('QJ00004', 'Error en la facturación', 'Me están cobrando de más en mi factura mensual. Hay cargos duplicados que necesito que revisen y corrijan.', NOW() - INTERVAL '7 days', 13, false, true),
('QJ00005', 'Problema con el horario de entrega', 'El almuerzo siempre llega después de las 2:00 PM cuando debería llegar a las 12:30 PM. Esto afecta mi horario de trabajo.', NOW() - INTERVAL '2 days', 14, true, true);

-- Insertar sugerencias de prueba
INSERT INTO "Sugerencia" ("codigoSugerencia", "asunto", "detalle", "fechaCreacion", "idUsuario", "activo") VALUES
('SG00001', 'Microondas adicional', 'Recomendaría que compraran un microondas adicional. Muchas veces, debido a que solo son 3 microondas, se terminan creando colas de espera para usar el microondas.', NOW() - INTERVAL '4 days', 9, true),
('SG00002', 'Almuerzos más variados', 'Sería bueno que varíen más los almuerzos. Últimamente se repiten mucho los mismos platos y sería agradable tener más opciones.', NOW() - INTERVAL '6 days', 10, true),
('SG00003', 'Sistema de reservas online', 'Sugiero implementar un sistema de reservas online donde podamos elegir nuestro almuerzo con anticipación. Esto ayudaría a planificar mejor el menú.', NOW() - INTERVAL '2 days', 11, true),
('SG00004', 'Mejorar el empaquetado', 'El empaquetado actual no mantiene bien la temperatura. Sugiero usar recipientes más aislantes para que la comida llegue caliente.', NOW() - INTERVAL '5 days', 13, true),
('SG00005', 'Aplicación móvil', 'Sería excelente tener una aplicación móvil donde podamos ver el menú del día, hacer reservas y dar seguimiento a nuestros pedidos.', NOW() - INTERVAL '1 day', 14, true),
('SG00006', 'Opción vegetariana diaria', 'Como vegetariano, me gustaría que siempre haya al menos una opción vegetariana en el menú diario.', NOW() - INTERVAL '3 days', 9, true),
('SG00007', 'Sistema de puntos', 'Sugiero implementar un sistema de puntos por compras frecuentes que nos permita obtener descuentos o almuerzos gratis.', NOW() - INTERVAL '7 days', 10, true);

-- Verificar que los datos se insertaron correctamente
SELECT 'Quejas insertadas:' as mensaje;
SELECT COUNT(*) as total_quejas FROM "Queja" WHERE "activo" = true;

SELECT 'Sugerencias insertadas:' as mensaje;
SELECT COUNT(*) as total_sugerencias FROM "Sugerencia" WHERE "activo" = true; 
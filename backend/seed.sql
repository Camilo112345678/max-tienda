-- OPCIONAL: productos de ejemplo para probar el catálogo.
-- Ejecútalo una sola vez (si lo repites, se duplican).
INSERT INTO public.cat_productos
  (producto_origen_id, vendedor_id, nombre_vendedor, categoria, sku, nombre, descripcion, precio, stock)
VALUES
  (uuid_generate_v4(), uuid_generate_v4(), 'Taller Norte',  'Ropa',       'ROP-001', 'Chaqueta de mezclilla', 'Chaqueta clásica azul, talla M', 85000, 10),
  (uuid_generate_v4(), uuid_generate_v4(), 'Pasos',         'Ropa',       'ROP-002', 'Tenis deportivos',      'Tenis livianos para correr', 160000, 6),
  (uuid_generate_v4(), uuid_generate_v4(), 'Tecnomax',      'Tecnología', 'TEC-001', 'Audífonos inalámbricos', 'Bluetooth con micrófono y estuche', 230000, 15),
  (uuid_generate_v4(), uuid_generate_v4(), 'KeyLab',        'Tecnología', 'TEC-002', 'Teclado mecánico',      'Teclado con luz y cable USB', 310000, 4),
  (uuid_generate_v4(), uuid_generate_v4(), 'Vivero Verde',  'Hogar',      'HOG-001', 'Planta monstera',       'Planta de interior mediana', 38000, 20),
  (uuid_generate_v4(), uuid_generate_v4(), 'Barro Casa',    'Hogar',      'HOG-002', 'Lámpara de mesa',       'Lámpara de cerámica con luz cálida', 120000, 0),
  (uuid_generate_v4(), uuid_generate_v4(), 'Fit Hogar',     'Deportes',   'DEP-001', 'Mat de yoga',           'Tapete antideslizante de 6 mm', 54000, 12),
  (uuid_generate_v4(), uuid_generate_v4(), 'Libros del Sur','Libros',     'LIB-001', 'Novela de ciencia ficción', 'Novela usada en buen estado', 32000, 3);

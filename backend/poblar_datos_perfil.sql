-- Poblar datos de ejemplo para perfil de usuarios

-- Primero, crear rol por defecto si no existe
INSERT INTO roles (id, nombre_rol) 
VALUES (1, 'Médico')
ON CONFLICT (id) DO NOTHING;

-- Crear un consultorio de ejemplo si no existe
INSERT INTO consultorios (id, direccion) 
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Consultorio de Prueba'
)
ON CONFLICT (id) DO NOTHING;

-- Actualizar el usuario usuario2 con datos de ejemplo
UPDATE usuarios 
SET 
    nombre = 'Juan',
    apellido = 'Médico',
    dni = '12345678',
    matricula_profesional = 'MP-12345',
    telefono = '+54 11 1234-5678',
    consultorio_id = '11111111-1111-1111-1111-111111111111'
WHERE email = 'usuario2@ejemplo.com';

-- Si el usuario usuario2 no existe, crearlo
INSERT INTO usuarios (
    id,
    nombre,
    apellido,
    email,
    contrasena_hash,
    dni,
    matricula_profesional,
    telefono,
    rol_id,
    consultorio_id,
    activo,
    creado_en
) 
SELECT 
    gen_random_uuid(),
    'Juan',
    'Médico',
    'usuario2@ejemplo.com',
    '$2a$10$0inrQqSlmKXL3yDOW6/ft.pE2Gq0MRSoTLIKMbwFFmkdnReCpea26', -- password
    '12345678',
    'MP-12345',
    '+54 11 1234-5678',
    1,
    '11111111-1111-1111-1111-111111111111',
    true,
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE email = 'usuario2@ejemplo.com'
);


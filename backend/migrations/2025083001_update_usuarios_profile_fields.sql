-- +goose Up
-- Agregar campos de perfil a la tabla usuarios
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS apellido VARCHAR(100),
ADD COLUMN IF NOT EXISTS dni VARCHAR(20),
ADD COLUMN IF NOT EXISTS telefono VARCHAR(20),
ADD COLUMN IF NOT EXISTS matricula_profesional VARCHAR(50);

-- +goose Down
-- Remover campos de perfil de la tabla usuarios
ALTER TABLE usuarios 
DROP COLUMN IF EXISTS apellido,
DROP COLUMN IF EXISTS dni,
DROP COLUMN IF EXISTS telefono,
DROP COLUMN IF EXISTS matricula_profesional;
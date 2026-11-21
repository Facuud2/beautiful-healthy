-- +goose Up
-- Eliminar los campos antiguos y agregar los nuevos campos compuestos para domicilio
ALTER TABLE pacientes
    DROP COLUMN IF EXISTS domicilio,
    DROP COLUMN IF EXISTS direccion,
    ADD COLUMN IF NOT EXISTS calle VARCHAR(100),
    ADD COLUMN IF NOT EXISTS numero VARCHAR(10),
    ADD COLUMN IF NOT EXISTS localidad VARCHAR(100),
    ADD COLUMN IF NOT EXISTS codigo_postal VARCHAR(10);

-- +goose Down
ALTER TABLE pacientes
    DROP COLUMN IF EXISTS calle,
    DROP COLUMN IF EXISTS numero,
    DROP COLUMN IF EXISTS localidad,
    DROP COLUMN IF EXISTS codigo_postal,
    ADD COLUMN domicilio VARCHAR(255),
    ADD COLUMN direccion TEXT;

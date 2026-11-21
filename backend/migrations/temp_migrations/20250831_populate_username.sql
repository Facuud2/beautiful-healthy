-- +goose Up
-- Poblar el campo username con la lógica: primera letra del nombre + apellido (todo en minúsculas, sin espacios)
UPDATE usuarios
SET username = LOWER(
    LEFT(TRIM(nombre), 1) || REGEXP_REPLACE(TRIM(apellido), '\\s+', '', 'g')
)
WHERE username = '' OR username IS NULL;

-- +goose Down
-- Dejar username vacío (no se puede restaurar el valor anterior)
UPDATE usuarios SET username = '';

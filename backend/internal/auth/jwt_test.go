package auth_test

import (
    "testing"
    "time"

    "github.com/golang-jwt/jwt/v5" // O la librería JWT que estés usando
)

// Una estructura de claims de ejemplo para usar en los benchmarks
var sampleClaims = jwt.MapClaims{
    "user_id": 123,
    "role":    "admin",
    "exp":     time.Now().Add(time.Hour * 72).Unix(),
}

// Tu clave secreta. ¡En una app real, esto viene de una variable de entorno!
var jwtSecretKey = []byte("mi_secreto_muy_seguro_para_pruebas")

// --- Benchmark para la Firma de Tokens ---

func BenchmarkSignJWT(b *testing.B) {
    // b.ReportAllocs() es útil para ver cuántas asignaciones de memoria hace la función.
    b.ReportAllocs()

    // El código que queremos medir está dentro de este bucle.
    // Go ajustará b.N para que la prueba dure un tiempo razonable.
    for i := 0; i < b.N; i++ {
        // Creamos el token con el algoritmo y los claims
        token := jwt.NewWithClaims(jwt.SigningMethodHS256, sampleClaims)

        // Firmamos el token para obtener el string completo. ESTA es la operación costosa.
        _, err := token.SignedString(jwtSecretKey)
        if err != nil {
            b.Fatal(err) // Si hay un error, el benchmark debe fallar
        }
    }
}

// --- Benchmark para la Verificación de Tokens ---

func BenchmarkVerifyJWT(b *testing.B) {
    // 1. Pre-generamos un token válido UNA SOLA VEZ fuera del bucle.
    //    No queremos medir la firma en el benchmark de verificación.
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, sampleClaims)
    tokenString, err := token.SignedString(jwtSecretKey)
    if err != nil {
        b.Fatal(err)
    }

    b.ReportAllocs()
    // 2. Reiniciamos el temporizador para que la generación anterior no cuente.
    b.ResetTimer()

    // 3. Medimos únicamente la verificación dentro del bucle.
    for i := 0; i < b.N; i++ {
        _, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            return jwtSecretKey, nil
        })
        if err != nil {
            b.Fatal(err)
        }
    }
}
> ### Benchmark de Rendimiento JWT
>
> Fecha: 25 de Agosto de 2025
> Entorno: Go 1.2x, CPU AMD Ryzen 7 5700G with Radeon Graphics
>
> Se realizaron benchmarks para las operaciones de firma y verificación de tokens JWT utilizando el algoritmo **HS256**.
>
> | Operación   | Iteraciones | Tiempo / Operación (ns/op) | Memoria / Operación (B/op) | Asignaciones / Operación (allocs/op) |
> | :---------- | :---------- | :------------------------- | :------------------------- | :----------------------------------- |
> | BenchmarkSignJWT-16   | 394401      | 2558 ns/op (~2.7 µs)          | 2026 B/op                     | 33 allocs/op17                                   |
> | BenchmarkVerifyJWT-16  | 239166      | 4251 ns/op (~4.2 µs)          | 50 allocs B/op                   | 50 allocs/op23                                   |
>
> **Análisis de `pprof`:**
>
Análisis Detallado por Operación
1. Firma de JWT (BenchmarkSignJWT-16)

    Tiempo (~2.6 µs): Firmar un nuevo token es una operación extremadamente rápida. Un tiempo de 2.6 microsegundos (millonésimas de segundo) es excelente.

    Contexto de Impacto: Esta operación ocurre únicamente cuando un usuario inicia sesión correctamente. Dado que los inicios de sesión son mucho menos frecuentes que las solicitudes a endpoints protegidos, este rendimiento es más que suficiente y no representa ningún tipo de cuello de botella.

    Asignaciones de Memoria (33 allocs/op): El número de asignaciones se refiere a cuántas veces Go tuvo que solicitar nueva memoria en el heap. 33 asignaciones es un número razonable para una operación criptográfica que involucra la construcción de varias estructuras de datos (headers, claims, firma). Un número alto de asignaciones puede presionar al Garbage Collector (GC), pero en este nivel y frecuencia, es completamente aceptable.

2. Verificación de JWT (BenchmarkVerifyJWT-16)

    Tiempo (~4.2 µs): La verificación tarda aproximadamente un 65% más que la firma. Este es un comportamiento completamente normal y esperado. La verificación implica más pasos:

        Decodificar el string del token (que está en Base64URL).

        Parsear el JSON del header y los claims.

        Validar los claims estándar (como la fecha de expiración exp).

        Realizar la operación criptográfica para verificar la firma.

    Contexto de Impacto: Esta es la métrica más importante de las dos. Esta operación se ejecuta en cada solicitud a un endpoint protegido por tu middleware. Un tiempo de 4.2 microsegundos es un resultado fantástico.

    Impacto en la Escalabilidad: Para ponerlo en perspectiva, un solo núcleo de CPU podría, teóricamente, realizar:
    1 segundo / 4.2 microsegundos ≈ 238,000 verificaciones por segundo
    Esto demuestra que la verificación de JWT no será un cuello de botella incluso bajo una carga muy alta. La latencia de tu aplicación estará dominada por otros factores como las consultas a la base de datos, las llamadas a otros servicios o la lógica de negocio compleja.

    Asignaciones de Memoria (50 allocs/op): Al igual que con la firma, este número es un poco más alto porque el proceso de parseo y validación requiere crear más objetos en memoria. Sigue siendo un valor totalmente aceptable que no causará problemas de rendimiento.


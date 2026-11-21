package main

import (
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
)

func HashExample() {
	password := "password"

	// Generar hash
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Hash generado para 'password': %s\n", string(hash))

	// Verificar el hash existente
	existingHash := "$2a$10$E6fHqnUjNfvVCl/yVWfgQ.f6u5rA94CQaO0vYM1XWiQlU3rqGUKi6"
	err = bcrypt.CompareHashAndPassword([]byte(existingHash), []byte(password))
	if err != nil {
		fmt.Printf("ERROR: El hash existente NO coincide con 'password': %v\n", err)
	} else {
		fmt.Printf("✅ El hash existente SÍ coincide con 'password'\n")
	}
}

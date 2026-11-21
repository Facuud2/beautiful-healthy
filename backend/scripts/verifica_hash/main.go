package main

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	usuarios := []struct {
		Username string
		Hash     string
	}{
		{"ugarcía", "$2a$10$DAZdI0aZnepgSgkwg71N1.83NvCo.F0g5TCtAPp1ovGchl7iZz.hS"},
		{"ugimenez", "$2a$10$DAZdI0aZnepgSgkwg71N1.83NvCo.F0g5TCtAPp1ovGchl7iZz.hS"},
		{"tuserd8ebbce4-f845-4115-8657-d4e1c91802ca", "$2a$10$lSDDqbckBesshgCmccTZk.rc7ct55KqFzWtSRxa5G/2CCu.4Lny/a"},
	}
	for _, u := range usuarios {
		err := bcrypt.CompareHashAndPassword([]byte(u.Hash), []byte("password"))
		if err == nil {
			fmt.Printf("%s: password OK\n", u.Username)
		} else {
			fmt.Printf("%s: password INCORRECTO\n", u.Username)
		}
	}
}

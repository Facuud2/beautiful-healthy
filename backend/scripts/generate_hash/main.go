package main
import "fmt"
import "log"
import "golang.org/x/crypto/bcrypt"
func main() {
	hash, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Hash para password: %s\n", string(hash))
}

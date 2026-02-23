package core

import "golang.org/x/crypto/bcrypt"

// HashPassword returns a bcrypt hash of the plaintext password.
// Uses bcrypt.DefaultCost (10).
func HashPassword(password string) (string, error) {
	enc, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(enc), err
}

// CheckPassword compares a bcrypt hash with a plaintext password.
// Returns nil if they match, error otherwise.
func CheckPassword(hash, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
}

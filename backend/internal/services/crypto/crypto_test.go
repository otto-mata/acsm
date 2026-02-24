package cryptoservice_test

import (
	cryptoservice "acsm/internal/services/crypto"
	"testing"
)

func TestHashPassword(t *testing.T) {
	pass := "password1"
	enc, err := cryptoservice.HashPassword(pass)
	if err != nil {
		t.Fatal("expected no error, got ", err)
	}
	if enc == pass {
		t.Fatal("expected hash to be different from input")
	}
	if err := cryptoservice.CheckPassword(enc, pass); err != nil {
		t.Fatal("expected password to match hash")
	}
	if err := cryptoservice.CheckPassword(enc, "password2"); err == nil {
		t.Fatal("expected password to NOT match hash")
	}
	enc2, err := cryptoservice.HashPassword(pass)
	if err != nil {
		t.Fatal("expected no error, got ", err)
	}
	if enc == enc2 {
		t.Fatal("expected first hash to be different from second hash")
	}
}

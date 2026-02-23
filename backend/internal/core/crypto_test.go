package core_test

import (
	"acsm/internal/core"
	"testing"
)

func TestHashPassword(t *testing.T) {
	pass := "password1"
	enc, err := core.HashPassword(pass)
	if err != nil {
		t.Fatal("expected no error, got ", err)
	}
	if enc == pass {
		t.Fatal("expected hash to be different from input")
	}
	if err := core.CheckPassword(enc, pass); err != nil {
		t.Fatal("expected password to match hash")
	}
	if err := core.CheckPassword(enc, "password2"); err == nil {
		t.Fatal("expected password to NOT match hash")
	}
	enc2, err := core.HashPassword(pass)
	if err != nil {
		t.Fatal("expected no error, got ", err)
	}
	if enc == enc2 {
		t.Fatal("expected first hash to be different from second hash")
	}
}

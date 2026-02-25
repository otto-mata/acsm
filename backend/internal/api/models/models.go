package models

import "github.com/google/uuid"

type MicroContextClaims struct {
	UserID uuid.UUID `json:"user_id"`
	Role   string    `json:"role"`
}

const ClaimsKey string = "claims"

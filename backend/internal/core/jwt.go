package core

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type Claims struct {
	UserID  uuid.UUID `json:"user_id"`
	Role    string    `json:"role"`
	TokenID uuid.UUID `json:"token_id"`
	jwt.RegisteredClaims
}

// GenerateAccessToken creates a short-lived signed JWT (60 min TTL)
func GenerateAccessToken(userID uuid.UUID, role string, secret string, ttl int64) (string, error) {
	tokenID := uuid.New()
	claims := Claims{
		UserID:  userID,
		Role:    role,
		TokenID: tokenID,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID.String(),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			ID:        tokenID.String(),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(ttl) * time.Minute)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// GenerateRefreshToken creates a long-lived signed JWT (3 day TTL)
func GenerateRefreshToken(userID uuid.UUID, secret string, ttl int64) (string, error) {

	return "", nil
}

// ValidateToken parses and validates a JWT string, returns Claims or error
func ValidateToken(tokenString, secret string) (*Claims, error) {
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected method: %s", t.Method.Alg())
		}
		return secret, nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}
	return &Claims{
		UserID:  uuid.MustParse(claims["user_id"].(string)),
		Role:    claims["role"].(string),
		TokenID: uuid.MustParse(claims["token_id"].(string)),
	}, nil
}

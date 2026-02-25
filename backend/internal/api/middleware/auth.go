package middleware

import (
	configservice "acsm/internal/services/config"
	jwtservice "acsm/internal/services/jwt"
	"context"
	"net/http"
	"strings"

	"github.com/google/uuid"
)

type MicroContextClaims struct {
	UserID uuid.UUID `json:"user_id"`
	Role   string    `json:"role"`
}

type contextKey string

const ClaimsKey contextKey = "claims"

func NewAuthMiddleware(
	config configservice.Config,
	jwtService jwtservice.JWTService,
) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if !strings.HasPrefix(authHeader, "Bearer ") {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
			token, err := jwtService.ValidateAccessToken(tokenStr)

			if err != nil {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), ClaimsKey, MicroContextClaims{UserID: token.UserID, Role: token.Role})
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

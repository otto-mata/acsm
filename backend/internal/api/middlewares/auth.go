package middlewares

import (
	"acsm/internal/api/models"
	configservice "acsm/internal/services/config"
	jwtservice "acsm/internal/services/jwt"
	"context"
	"net/http"
)

func NewAuthMiddleware(
	config configservice.Config,
	jwtService jwtservice.JWTService,
) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenCookie, err := r.Cookie("access_token")
			if err != nil {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}
			token, err := jwtService.ValidateAccessToken(tokenCookie.Value)
			if err != nil {
				http.Error(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), models.ClaimsKey, models.MicroContextClaims{UserID: token.UserID, Role: token.Role})
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

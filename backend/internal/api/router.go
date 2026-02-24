package api

import (
	"acsm/internal/api/handlers"
	configservice "acsm/internal/services/config"
	jwtservice "acsm/internal/services/jwt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func NewRouter(
	configService configservice.ConfigService,
	jwtService jwtservice.JWTService,
) http.Handler {
	router := chi.NewMux()
	router.Use(
		middleware.RequestID,
		middleware.RealIP,
		middleware.Logger,
		middleware.Recoverer,
	)

	router.Get("/health", handlers.GetHealth)

	return router
}

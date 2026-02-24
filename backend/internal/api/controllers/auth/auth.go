package authcontroller

import (
	authservice "acsm/internal/services/auth"
	configservice "acsm/internal/services/config"
	jwtservice "acsm/internal/services/jwt"
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/samber/do"
)

type authController struct {
	authService authservice.AuthService
	jwtService  jwtservice.JWTService
	config      configservice.Config
}

func Init(api *chi.Mux, injector *do.Injector) {
	authController := &authController{
		authService: do.MustInvoke[authservice.AuthService](injector),
		jwtService:  do.MustInvoke[jwtservice.JWTService](injector),
		config:      do.MustInvoke[configservice.ConfigService](injector).GetConfig(),
	}
	authController.Register(api)
}

func (ctrl *authController) Register(api *chi.Mux) {
	api.Post("/auth/login", func(w http.ResponseWriter, r *http.Request) {
		var req LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil ||
			req.Email == "" ||
			req.Password == "" {
			http.Error(w, "invalid request", http.StatusBadRequest)
			return
		}
		user, err := ctrl.authService.AuthenticateUser(r.Context(), req.Email, req.Password)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		token, err := ctrl.jwtService.GenerateAccessToken(user.ID, user.Role)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		refreshToken, err := ctrl.jwtService.GenerateRefreshToken(user.ID)
		var res LoginResponse
		res.AccessToken = token
		http.SetCookie(w, &http.Cookie{
			Name:     "refresh_token",
			Value:    refreshToken,
			HttpOnly: true, // not accessible via JS
			// Secure:   true, // HTTPS only
			SameSite: http.SameSiteStrictMode,
			Path:     "/auth/refresh",
			MaxAge:   ctrl.config.RefreshTokenTTLDay * 24 * 3600,
		})
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(res)
	})
}

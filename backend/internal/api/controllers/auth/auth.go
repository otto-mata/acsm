package authcontroller

import (
	apiutils "acsm/internal/api/utils"
	authservice "acsm/internal/services/auth"
	configservice "acsm/internal/services/config"
	cryptoservice "acsm/internal/services/crypto"
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

func Init(api chi.Router, injector *do.Injector) {
	authController := &authController{
		authService: do.MustInvoke[authservice.AuthService](injector),
		jwtService:  do.MustInvoke[jwtservice.JWTService](injector),
		config:      do.MustInvoke[configservice.ConfigService](injector).GetConfig(),
	}
	api.Route("/auth", func(r chi.Router) {
		authController.Validate(r)
		authController.Login(r)
		authController.Register(r)
		authController.Refresh(r)
		authController.Logout(r)
	})
}

func (ctrl *authController) Validate(api chi.Router) {
	api.Post("/validate", func(w http.ResponseWriter, r *http.Request) {
		tokenCookie, err := r.Cookie("access_token")
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		_, err = ctrl.jwtService.ValidateAccessToken(tokenCookie.Value)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		w.WriteHeader(http.StatusOK)
	})
}

func (ctrl *authController) Login(api chi.Router) {
	api.Post("/login", func(w http.ResponseWriter, r *http.Request) {
		var req LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "invalid request", http.StatusBadRequest)
			return
		}
		user, err := ctrl.authService.AuthenticateUser(r.Context(), req.Email, req.Password)
		if err != nil {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		token, err := ctrl.jwtService.GenerateAccessToken(r.Context(), user.ID, user.Role)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		refreshToken, err := ctrl.jwtService.GenerateRefreshToken(r.Context(), user.ID)

		http.SetCookie(w, &http.Cookie{
			Name:     "refresh_token",
			Value:    refreshToken.Token,
			HttpOnly: true, // not accessible via JS
			// Secure:   true, // HTTPS only
			SameSite: http.SameSiteStrictMode,
			Path:     "/auth/refresh",
			MaxAge:   ctrl.config.RefreshTokenTTLDay * 24 * 3600,
		})

		http.SetCookie(w, &http.Cookie{
			Name:     "access_token",
			Value:    token.Token,
			HttpOnly: true, // not accessible via JS
			// Secure:   true, // HTTPS only
			SameSite: http.SameSiteStrictMode,
			Path:     "/",
			MaxAge:   ctrl.config.AccessTokenTTLMin * 60,
		})
		apiutils.AsJson(w, user, 200)
	})
}

func (ctrl *authController) Register(api chi.Router) {
	api.Post("/register", func(w http.ResponseWriter, r *http.Request) {
		var req RegisterRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil ||
			req.Email == "" ||
			req.Password == "" ||
			req.Role == "" ||
			req.Name == "" {
			http.Error(w, "invalid request", http.StatusBadRequest)
			return
		}
		if err := cryptoservice.CheckPassword(ctrl.config.AdministrativePassword, req.AdministrativePassword); err != nil {
			apiutils.AsJson(w, map[string]any{
				"success": false,
				"error":   err.Error(),
			}, http.StatusUnauthorized)
			return
		}
		_, err := ctrl.authService.RegisterUser(r.Context(), req.Email, req.Name, req.Role, req.Password)
		if err != nil {
			apiutils.AsJson(w, map[string]any{
				"success": false,
				"error":   err.Error(),
			}, http.StatusInternalServerError)
			return
		}
		apiutils.AsJson(w, map[string]any{
			"success": true,
		}, http.StatusCreated)
	})
}

func (ctrl *authController) Refresh(api chi.Router) {
	api.Post("/refresh", func(w http.ResponseWriter, r *http.Request) {

		rtCookie, err := r.Cookie("refresh_token")
		if err != nil {
			apiutils.AsJson(w, map[string]any{
				"error": err.Error(),
			}, 400)
		}

		accessToken, err := ctrl.authService.RefreshUser(r.Context(), rtCookie.Value)
		if err != nil {
			apiutils.AsJson(w, map[string]any{
				"error": err.Error(),
			}, 403)
			return
		}
		apiutils.AsJson(w, RefreshResponse{AccessToken: accessToken}, 200)
	})
}

func (ctrl *authController) Logout(api chi.Router) {
	api.Post("/logout", func(w http.ResponseWriter, r *http.Request) {
		err := ctrl.authService.Logout(r.Context())
		if err != nil {
			apiutils.AsJson(w, map[string]any{
				"error": err.Error(),
			}, 400)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})
}

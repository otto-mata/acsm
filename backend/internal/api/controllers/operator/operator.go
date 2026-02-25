package operatorcontroller

import (
	"acsm/internal/api/middlewares"
	apiutils "acsm/internal/api/utils"
	authservice "acsm/internal/services/auth"
	configservice "acsm/internal/services/config"
	jwtservice "acsm/internal/services/jwt"
	"acsm/internal/store"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/samber/do"
)

type operatorController struct {
	authService authservice.AuthService
	jwtService  jwtservice.JWTService
	dbService   *store.Queries
	config      configservice.Config
}

func InitWithInjector(injector *do.Injector) func(chi.Router) {
	return func(api chi.Router) {
		authController := &operatorController{
			authService: do.MustInvoke[authservice.AuthService](injector),
			jwtService:  do.MustInvoke[jwtservice.JWTService](injector),
			config:      do.MustInvoke[configservice.ConfigService](injector).GetConfig(),
			dbService:   do.MustInvoke[*store.Queries](injector),
		}
		api.Use(middlewares.RequireRole("operator"))
		authController.Dummy(api)
	}

}

func (ctrl *operatorController) Dummy(api chi.Router) {
	api.Get("/dummy", func(w http.ResponseWriter, r *http.Request) {
		apiutils.AsJson(w, map[string]any{
			"dummy_response": "dummy_value_operator",
		}, http.StatusOK)
	})
}

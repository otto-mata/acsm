package usercontroller

import (
	api "acsm/internal/api/utils"
	"acsm/internal/domain"
	configservice "acsm/internal/services/config"
	userservice "acsm/internal/services/user"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/samber/do"
)

type userController struct {
	svc    userservice.UserService
	config configservice.Config
}

func InitWithInjector(injector *do.Injector) func(api chi.Router) {
	return func(api chi.Router) {
		userController := &userController{
			config: do.MustInvoke[configservice.ConfigService](injector).GetConfig(),
			svc:    do.MustInvoke[userservice.UserService](injector),
		}
		userController.GetMe(api)
		userController.GetUsers(api)
		userController.GetUser(api)
		userController.PostUser(api)
		userController.PutUser(api)
		userController.DeleteUser(api)
	}
}

func (ctrl *userController) GetMe(r chi.Router) {
	r.Get("/me", func(w http.ResponseWriter, r *http.Request) {
		claims, err := api.GetClaims(r.Context())
		if err != nil {
			api.Error401(w)
			return
		}
		user, err := ctrl.svc.GetUserByID(r.Context(), claims.UserID)
		if err != nil {
			if err == pgx.ErrNoRows {
				api.Error404(w)
				return
			}
			api.Error500(w, err.Error())
			return
		}
		api.Success200(w, user)
	})
}

func (ctrl *userController) GetUsers(r chi.Router) {
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		users, err := ctrl.svc.ListUsers(r.Context())
		if err != nil {
			api.Error500(w, err.Error())
			return
		}
		api.Success200(w, users)
	})
}

func (ctrl *userController) GetUser(r chi.Router) {
	r.Get("/{id}", func(w http.ResponseWriter, r *http.Request) {
		id, err := api.ResourceIDFromRequest(r)
		if err != nil {
			api.Error400(w, err.Error())
			return
		}
		user, err := ctrl.svc.GetUserByID(r.Context(), id)
		if err != nil {
			if err == pgx.ErrNoRows {
				api.Error404(w)
				return
			}
			api.Error500(w, err.Error())
			return
		}
		api.Success200(w, user)
	})
}

func (ctrl *userController) PostUser(r chi.Router) {
	r.Post("/", func(w http.ResponseWriter, r *http.Request) {
		params, err := api.ParseAndValidateRequest[domain.UserPost](r)
		if err != nil {
			api.Error400(w, err.Error())
			return
		}
		user, err := ctrl.svc.CreateUser(r.Context(), params.Email, params.Name, params.Role, params.Password)

		if err != nil {
			if pgerr, ok := err.(*pgconn.PgError); ok {
				if pgerr.Code == "23505" {
					api.Error409(w, "Email is already taken")
					return
				}
			}
			api.Error500(w, err.Error())
			return
		}
		api.Success201(w, user)
	})
}

func (ctrl *userController) PutUser(r chi.Router) {
	r.Put("/{id}", func(w http.ResponseWriter, r *http.Request) {
		id, err := api.ResourceIDFromRequest(r)
		if err != nil {
			api.Error400(w, err.Error())
			return
		}
		params, err := api.ParseAndValidateRequest[domain.UpdateUser](r)
		if err := ctrl.svc.UpdateUser(r.Context(), id, params.Name, params.Role); err != nil {
			if err == pgx.ErrNoRows {
				api.Error404(w)
				return
			}
			api.Error500(w, err.Error())
			return
		}
		w.WriteHeader(http.StatusOK)
	})
}

func (ctrl *userController) DeleteUser(r chi.Router) {
	r.Delete("/{id}", func(w http.ResponseWriter, r *http.Request) {
		id, err := api.ResourceIDFromRequest(r)
		if err != nil {
			api.Error400(w, err.Error())
			return
		}
		if err := ctrl.svc.DeleteUser(r.Context(), id); err != nil {
			if err == pgx.ErrNoRows {
				api.Error404(w)
				return
			}
			api.Error500(w, err.Error())
			return
		}
	})
}

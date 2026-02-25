package usercontroller

import (
	apiutils "acsm/internal/api/utils"
	configservice "acsm/internal/services/config"
	userservice "acsm/internal/services/user"
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/samber/do"
)

type UserPost struct {
	Email    string `json:"email" validate:"required,email"`
	Name     string `json:"name" validate:"required"`
	Role     string `json:"role" validate:"oneof=admin operator viewer"`
	Password string `json:"password" validate:"max=64,min=12"`
}

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
		userController.GetUsers(api)
		userController.GetUser(api)
		userController.PostUser(api)
		userController.PutUser(api)
		userController.DeleteUser(api)
	}
}

func (ctrl *userController) GetUsers(r chi.Router) {
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		users, err := ctrl.svc.ListUsers(r.Context())
		if err != nil {
			apiutils.AsJson(w, map[string]any{
				"error": err.Error(),
			}, 500)
			return
		}
		apiutils.AsJson(w, users, 200)
	})
}

func (ctrl *userController) GetUser(r chi.Router) {
	r.Get("/{id}", func(w http.ResponseWriter, r *http.Request) {
		id, err := uuid.Parse(chi.URLParam(r, "id"))
		if err != nil {
			apiutils.AsJson(w, map[string]any{
				"error": err.Error(),
			}, 400)
			return
		}
		user, err := ctrl.svc.GetUserByID(r.Context(), id)
		if err != nil {
			if err == pgx.ErrNoRows {
				apiutils.AsJson(w, map[string]any{
					"error": "no record found",
				}, 404)
				return
			}
			apiutils.AsJson(w, map[string]any{
				"error": err.Error(),
			}, 200)
			return
		}
		apiutils.AsJson(w, user, 200)
	})
}

func (ctrl *userController) PostUser(r chi.Router) {
	r.Post("/", func(w http.ResponseWriter, r *http.Request) {
		var reqBody UserPost
		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			apiutils.AsJson(w, map[string]any{
				"error": err.Error(),
			}, http.StatusBadRequest)
			return
		}
		err := validator.New().Struct(reqBody)
		if err != nil {
			apiutils.AsJson(w, map[string]any{
				"error": err.Error(),
			}, http.StatusBadRequest)
			return
		}
		user, err := ctrl.svc.CreateUser(r.Context(), reqBody.Email, reqBody.Name, reqBody.Role, reqBody.Password)

		if err != nil {
			if pgerr, ok := err.(*pgconn.PgError); ok {
				if pgerr.Code == "23505" {
					apiutils.AsJson(w, map[string]any{
						"error": "Email is already taken",
					}, http.StatusConflict)
					return
				}
			}
			apiutils.AsJson(w, map[string]any{
				"error": err.Error(),
			}, http.StatusBadRequest)
			return
		}
		apiutils.AsJson(w, user, http.StatusBadRequest)
	})
}

func (ctrl *userController) PutUser(r chi.Router) {
	r.Put("/{id}", func(w http.ResponseWriter, r *http.Request) {
		id, err := uuid.Parse(chi.URLParam(r, "id"))
		if err != nil {
			apiutils.AsJson(w, map[string]any{
				"error": err.Error(),
			}, 400)
			return
		}
		var reqBody struct {
			Name string `json:"name"`
			Role string `json:"role"`
		}

		if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
			apiutils.AsJson(w, map[string]any{
				"error": err.Error(),
			}, http.StatusBadRequest)
			return
		}
		if err := ctrl.svc.UpdateUser(r.Context(), id, reqBody.Name, reqBody.Role); err != nil {
			if err == pgx.ErrNoRows {
				apiutils.AsJson(w, map[string]any{
					"error": "no record found",
				}, 404)
				return
			}
			apiutils.AsJson(w, map[string]any{
				"error": err.Error(),
			}, http.StatusBadRequest)
			return
		}
		w.WriteHeader(http.StatusOK)
	})
}

func (ctrl *userController) DeleteUser(r chi.Router) {
	r.Delete("/{id}", func(w http.ResponseWriter, r *http.Request) {
		id, err := uuid.Parse(chi.URLParam(r, "id"))
		if err != nil {
			apiutils.AsJson(w, map[string]any{
				"error": err.Error(),
			}, 400)
			return
		}
		if err := ctrl.svc.DeleteUser(r.Context(), id); err != nil {
			if err == pgx.ErrNoRows {
				apiutils.AsJson(w, map[string]any{
					"error": "no record found",
				}, 404)
				return
			}
			apiutils.AsJson(w, map[string]any{
				"error": err.Error(),
			}, 500)
			return
		}
	})
}

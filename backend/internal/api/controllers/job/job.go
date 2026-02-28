package jobcontroller

import (
	"acsm/internal/api/middlewares"
	api "acsm/internal/api/utils"
	"acsm/internal/domain"
	configservice "acsm/internal/services/config"
	jobservice "acsm/internal/services/job"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/samber/do"
)

type jobController struct {
	svc    jobservice.JobService
	config configservice.Config
}

func InitWithInjector(injector *do.Injector) func(api chi.Router) {
	return func(api chi.Router) {
		jobController := &jobController{
			config: do.MustInvoke[configservice.ConfigService](injector).GetConfig(),
			svc:    do.MustInvoke[jobservice.JobService](injector),
		}
		jobController.ListJobs(api)
		jobController.GetJob(api)
		api.Group(func(r chi.Router) {
			r.Use(middlewares.RequireRole("operator"))
			jobController.PostJob(api)
			jobController.PutJob(api)
			jobController.DeleteJob(api)
		})
	}
}

func (ctrl *jobController) ListJobs(r chi.Router) {
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		qValues := r.URL.Query()
		fType := qValues.Get("type")
		sPage := qValues.Get("page")
		iPage, err := strconv.Atoi(sPage)
		if sPage == "" {
			iPage = 0
		} else if err != nil {
			api.Error400(w, "page must be a number")
			return
		}

		sLimit := qValues.Get("limit")
		iLimit, err := strconv.Atoi(sLimit)
		if sLimit == "" {
			iLimit = 50
		} else if err != nil {
			api.Error400(w, "limit must be a number")
			return
		}
		offset := iLimit * iPage
		list, err := ctrl.svc.ListJobs(r.Context(), domain.ListJobsFilters{
			Offset: offset,
			Limit:  iLimit,
			Type:   fType,
		})
		if err != nil {
			api.Error500(w, err.Error())
			return
		}
		api.Success200(w, list)
	})
}

func (ctrl *jobController) GetJob(r chi.Router) {
	r.Get("/{id}", func(w http.ResponseWriter, r *http.Request) {
		id, err := api.ResourceIDFromRequest(r)
		if err != nil {
			api.Error400(w, err.Error())
			return
		}
		job, err := ctrl.svc.GetJob(r.Context(), id)
		if err != nil {
			if err == pgx.ErrNoRows {
				api.Error404(w)
				return
			}
			api.Error500(w, err.Error())
			return
		}
		api.Success200(w, job)
	})
}

func (ctrl *jobController) PostJob(r chi.Router) {
	r.Post("/", func(w http.ResponseWriter, r *http.Request) {
		claims, err := api.GetClaims(r.Context())
		if err != nil {
			api.Error500(w, err.Error())
			return
		}
		params, err := api.ParseAndValidateRequest[domain.CreateJobParams](r)
		if err != nil {
			api.Error400(w, err.Error())
			return
		}
		job, err := ctrl.svc.CreateJob(r.Context(), claims.UserID, *params)
		if err != nil {
			api.Error500(w, err.Error())
			return
		}
		api.Success201(w, job)
	})
}

func (ctrl *jobController) PutJob(r chi.Router) {
	r.Put("/{id}", func(w http.ResponseWriter, r *http.Request) {
		id, err := api.ResourceIDFromRequest(r)
		if err != nil {
			api.Error400(w, err.Error())
			return
		}
		params, err := api.ParseAndValidateRequest[domain.UpdateJobParams](r)
		if err != nil {
			api.Error400(w, err.Error())
			return
		}
		job, err := ctrl.svc.UpdateJob(r.Context(), id, *params)
		if err != nil {
			api.Error500(w, err.Error())
			return
		}
		api.Success200(w, job)
	})
}

func (ctrl *jobController) DeleteJob(r chi.Router) {
	r.Delete("/{id}", func(w http.ResponseWriter, r *http.Request) {
		id, err := api.ResourceIDFromRequest(r)
		if err != nil {
			api.Error400(w, err.Error())
			return
		}
		if err := ctrl.svc.DeleteJob(r.Context(), id); err != nil {
			api.Error500(w, err.Error())
			return
		}
		api.Success204(w)
	})
}

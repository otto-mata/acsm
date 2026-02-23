package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func NewRouter() http.Handler {
	router := chi.NewMux()
	router.Use(
		middleware.RequestID,
		middleware.RealIP,
		middleware.Logger,
		middleware.Recoverer,
	)

	router.Get("/panic", func(w http.ResponseWriter, r *http.Request) {
		panic("!")
	})

	return router
}

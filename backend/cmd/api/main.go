package main

import (
	authcontroller "acsm/internal/api/controllers/auth"
	"acsm/internal/api/handlers"
	mdlwr "acsm/internal/api/middleware"
	apiutils "acsm/internal/api/utils"
	"acsm/internal/services"
	configservice "acsm/internal/services/config"
	jwtservice "acsm/internal/services/jwt"
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/samber/do"
)

func main() {

	injector := do.New()
	services.InitServices(injector)

	log.Printf("Successfully loaded configuration\n")

	router := chi.NewRouter()
	router.Get("/health", handlers.GetHealth)
	router.Route("/api", apiMux(injector))
	authcontroller.Init(router, injector)

	log.Printf("Successfully created router\n")
	srv := &http.Server{
		Addr:         fmt.Sprintf("127.0.0.1:%d", do.MustInvoke[configservice.ConfigService](injector).GetConfig().Port),
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Println("Starting HTTP server on", srv.Addr)
		err := srv.ListenAndServe()
		if err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	<-c
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	} else {
		log.Println("Server gracefully shutdown")
	}
	log.Println("Exiting")
}

func apiMux(
	injector *do.Injector,
) func(chi.Router) {
	return func(r chi.Router) {
		config := do.MustInvoke[configservice.ConfigService](injector).GetConfig()
		jwtService := do.MustInvoke[jwtservice.JWTService](injector)
		r.Use(
			middleware.RequestID,
			middleware.RealIP,
			middleware.Logger,
			middleware.Recoverer,
			mdlwr.NewAuthMiddleware(
				config,
				jwtService,
			),
		)
		r.Get("/test", func(w http.ResponseWriter, r *http.Request) {
			v, ok := r.Context().Value(mdlwr.ClaimsKey).(mdlwr.MicroContextClaims)
			if !ok {
				log.Println("Context micro claims are not as expected")
				w.Write([]byte(":("))
			}
			apiutils.AsJson(w, v)
		})
	}
}

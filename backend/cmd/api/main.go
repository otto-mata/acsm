package main

import (
	"acsm/internal/api"
	"acsm/internal/services"
	configservice "acsm/internal/services/config"
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/samber/do"
)

func main() {

	injector := do.New()
	services.InitServices(injector)

	log.Printf("Successfully loaded configuration\n")

	router := api.NewRouter()
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

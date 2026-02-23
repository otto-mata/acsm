package main

import (
	"acsm/internal/core"
	"acsm/internal/store"
	"context"
	"log"
)

func main() {
	config, err := core.Load()
	if err != nil {
		panic(err)
	}
	log.Printf("Successfully loaded configuration\n")
	pool, err := store.NewPool(context.Background(), config.Database.DSN)
	if err != nil {
		panic(err)
	}
	defer pool.Close()
	log.Printf("Successfully created database connection pool\n")
}

package main

import (
	"acsm/internal/core"
	"acsm/internal/store"
	"context"
	"log"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func init() {
	m, err := migrate.New(
		"file://migrations",
		"postgres://postgres:postgres@localhost:5432/db?sslmode=disable&search_path=public")
	if err != nil {
		log.Fatal(err)
	}
	if err := m.Up(); err != nil {
		log.Fatal(err)
	}
}

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

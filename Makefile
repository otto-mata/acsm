DATABASE_URL ?= "postgres://postgres:postgres@localhost:5432/db?sslmode=disable&search_path=public"
MIGRATIONS_PATH ?= backend/migrations
migrate-up:
	migrate -database $(DATABASE_URL) -path $(MIGRATIONS_PATH) up
migrate-down:
	migrate -database $(DATABASE_URL) -path $(MIGRATIONS_PATH) down

.PHONY: migrate-up migrate-down

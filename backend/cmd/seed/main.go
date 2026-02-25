package main

import (
	configservice "acsm/internal/services/config"
	databaseservice "acsm/internal/services/database"
	userservice "acsm/internal/services/user"
	"context"
	"log"

	"github.com/samber/do"
)

func main() {

	injector := do.New()
	do.Provide(injector, configservice.NewProvider())
	do.Provide(injector, databaseservice.NewProvider())
	do.Provide(injector, userservice.NewProvider())

	user, err := do.MustInvoke[userservice.UserService](injector).CreateUser(
		context.Background(),
		"admin@acsm.fr",
		"Administrator",
		"admin",
		"password12345678",
	)
	if err != nil {
		log.Print("Already seeded")
	} else {
		log.Println("Created user with role admin, ID ", user.ID.String())
	}
}

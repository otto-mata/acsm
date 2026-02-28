package services

import (
	authservice "acsm/internal/services/auth"
	configservice "acsm/internal/services/config"
	databaseservice "acsm/internal/services/database"
	jobservice "acsm/internal/services/job"
	jwtservice "acsm/internal/services/jwt"
	userservice "acsm/internal/services/user"

	"github.com/samber/do"
)

func InitServices(i *do.Injector) error {
	do.Provide(i, configservice.NewProvider())
	do.Provide(i, databaseservice.NewProvider())
	do.Provide(i, jwtservice.NewProvider())
	do.Provide(i, userservice.NewProvider())
	do.Provide(i, authservice.NewProvider())
	do.Provide(i, jobservice.NewProvider())
	return nil
}

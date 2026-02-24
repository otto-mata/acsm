package services

import (
	configservice "acsm/internal/services/config"
	databaseservice "acsm/internal/services/database"

	"github.com/samber/do"
)

func InitServices(i *do.Injector) error {
	do.Provide(i, configservice.NewProvider())
	do.Provide(i, databaseservice.NewProvider())
	return nil
}

package databaseservice

import (
	configservice "acsm/internal/services/config"
	"acsm/internal/store"
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/samber/do"
)

type DatabaseService *store.Queries

func NewProvider() func(i *do.Injector) (*store.Queries, error) {
	return func(i *do.Injector) (*store.Queries, error) {
		return New(do.MustInvoke[configservice.ConfigService](i))
	}
}

func New(configService configservice.ConfigService) (*store.Queries, error) {
	dbpool, err := pgxpool.New(context.Background(), configService.GetConfig().DSN)
	if err != nil {
		return nil, err
	}
	if err = dbpool.Ping(context.Background()); err != nil {
		dbpool.Close()
		return nil, err
	}
	return store.New(dbpool), nil
}

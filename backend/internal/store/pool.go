package store

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

func NewPool(ctx context.Context, dsn string) (*pgxpool.Pool, error) {
	dbpool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		return nil, err
	}
	if err = dbpool.Ping(ctx); err != nil {
		dbpool.Close()
		return nil, err
	}
	return dbpool, nil
}

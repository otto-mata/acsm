package api

import (
	"acsm/internal/domain"
	"context"
)

func GetClaims(ctx context.Context) (domain.MicroContextClaims, error) {
	v, ok := ctx.Value(domain.ClaimsKey).(domain.MicroContextClaims)
	if !ok {
		return domain.MicroContextClaims{}, nil
	}
	return v, nil
}

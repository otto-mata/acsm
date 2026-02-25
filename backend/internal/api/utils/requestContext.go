package apiutils

import (
	"acsm/internal/api/models"
	"context"
)

func GetClaims(ctx context.Context) (models.MicroContextClaims, error) {
	v, ok := ctx.Value(models.ClaimsKey).(models.MicroContextClaims)
	if !ok {
		return models.MicroContextClaims{}, nil
	}
	return v, nil
}

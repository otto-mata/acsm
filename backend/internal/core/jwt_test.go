package core_test

import (
	"acsm/internal/core"
	"testing"

	"github.com/google/uuid"
	"github.com/spf13/viper"
)

func TestJWT(t *testing.T) {
	userID := uuid.MustParse("09814f5d-c199-4f8a-af5c-97fd9b9b9f61")
	token, err := core.GenerateAccessToken(userID, "admin", viper.GetString("JWT_SECRET"), viper.GetInt64("ACCESS_TOKEN_TTL_MIN"))
	t.Log(token, err)
}

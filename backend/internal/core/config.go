package core

import (
	"fmt"

	"github.com/spf13/viper"
)

type serverConfig struct {
	Port int    `mapstructure:"PORT"`
	Env  string `mapstructure:"ENV"` // "development" | "production"
}
type databaseConfig struct {
	DSN string `mapstructure:"DATABASE_URL"`
}
type authConfig struct {
	JWTSecret          string `mapstructure:"JWT_SECRET"`
	AccessTokenTTLMin  int    `mapstructure:"ACCESS_TOKEN_TTL_MIN"`
	RefreshTokenTTLDay int    `mapstructure:"REFRESH_TOKEN_TTL_DAY"`
}
type executorConfig struct {
	MaxConcurrency int `mapstructure:"MAX_CONCURRENCY"`
}
type Config struct {
	Server   serverConfig
	Database databaseConfig
	Auth     authConfig
	Executor executorConfig
}

func Load() (*Config, error) {
    viper.AddConfigPath(".")
    viper.SetConfigName("app")
    viper.SetConfigType("env")
	err := viper.ReadInConfig()
	viper.AutomaticEnv()

	if err != nil {
		return nil, err
	}
	c := &Config{
		Server: serverConfig{
			Port: viper.GetInt("PORT"),
			Env:  viper.GetString("ENV"),
		},
		Database: databaseConfig{
			DSN: viper.GetString("DATABASE_URL"),
		},
		Auth: authConfig{
			JWTSecret:          viper.GetString("JWT_SECRET"),
			AccessTokenTTLMin:  viper.GetInt("ACCESS_TOKEN_TTL_MIN"),
			RefreshTokenTTLDay: viper.GetInt("REFRESH_TOKEN_TTL_DAY"),
		},
		Executor: executorConfig{
			MaxConcurrency: viper.GetInt("MAX_CONCURRENCY"),
		},
	}
	if c.Server.Port < 1000 {
		return nil, fmt.Errorf("invalid port number %d", c.Server.Port)
	}
	if c.Server.Env != "development" && c.Server.Env != "production" {
		return nil, fmt.Errorf("invalid value for env type, expected 'development' or 'production', got '%s'", c.Server.Env)
	}
	if c.Database.DSN == "" {
		return nil, fmt.Errorf("missing database connection string")
	}
	if c.Auth.JWTSecret == "" {
		return nil, fmt.Errorf("missing JWT secret")
	}
	if c.Auth.AccessTokenTTLMin == 0 || c.Auth.RefreshTokenTTLDay == 0 {
		return nil, fmt.Errorf("access token and refresh token ttl must not be 0")
	}
	return c, nil
}

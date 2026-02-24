package configservice

import (
	"reflect"

	"github.com/go-playground/validator/v10"
	"github.com/mcuadros/go-defaults"
	"github.com/samber/do"
	"github.com/spf13/viper"
)

type Config struct {
	Port               int    `mapstructure:"PORT"`
	Env                string `mapstructure:"ENV"` // "development" | "production"
	DSN                string `mapstructure:"DATABASE_URL"`
	MaxConcurrency     int    `mapstructure:"MAX_CONCURRENCY"`
	JWTSecret          string `mapstructure:"JWT_SECRET"`
	AccessTokenTTLMin  int    `mapstructure:"ACCESS_TOKEN_TTL_MIN"`
	RefreshTokenTTLDay int    `mapstructure:"REFRESH_TOKEN_TTL_DAY"`
}

type ConfigService interface {
	GetConfig() Config
}

type configService struct {
	config Config
}

func automaticBindEnv() {
	v := reflect.ValueOf(&Config{})
	t := v.Elem().Type()
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		env := field.Tag.Get("mapstructure")
		if env == "" {
			continue
		}
		_ = viper.BindEnv(env)
	}
}

func NewProvider() func(i *do.Injector) (ConfigService, error) {
	return func(i *do.Injector) (ConfigService, error) {
		return New()
	}
}

func New() (ConfigService, error) {
	viper.AddConfigPath(".")
	viper.SetConfigType("env")
	viper.SetConfigName(".env")

	_ = viper.ReadInConfig()

	viper.AutomaticEnv()
	automaticBindEnv()

	config := &Config{}
	err := viper.Unmarshal(config)
	if err != nil {
		return nil, err
	}

	defaults.SetDefaults(config)

	err = validator.New().Struct(config)
	if err != nil {
		return nil, err
	}
	return &configService{
		config: *config,
	}, nil
}

// GetConfig returns the configuration options for the service.
func (c *configService) GetConfig() Config {
	return c.config
}

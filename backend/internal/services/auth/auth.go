package authservice

import (
	configservice "acsm/internal/services/config"
	jwtservice "acsm/internal/services/jwt"
	userservice "acsm/internal/services/user"
	"context"

	"github.com/samber/do"
)

type AuthService interface {
	AuthenticateUser(
		ctx context.Context,
		email,
		password string,
	) (userservice.User, error)
}

type authService struct {
	config      configservice.Config
	jwtService  jwtservice.JWTService
	userService userservice.UserService
}

func NewProvider() func(i *do.Injector) (AuthService, error) {
	return func(i *do.Injector) (AuthService, error) {
		return New(
			do.MustInvoke[configservice.ConfigService](i),
			do.MustInvoke[jwtservice.JWTService](i),
			do.MustInvoke[userservice.UserService](i),
		)
	}
}

func New(
	configService configservice.ConfigService,
	jwtService jwtservice.JWTService,
	userService userservice.UserService,
) (AuthService, error) {
	config := configService.GetConfig()
	return &authService{
		config:      config,
		jwtService:  jwtService,
		userService: userService,
	}, nil
}

func (s *authService) AuthenticateUser(
	ctx context.Context,
	email,
	password string,
) (userservice.User, error) {
	return s.userService.CheckPasswordForUserWithEmail(ctx, email, password)
}

func (s *authService) RegisterUser(
	ctx context.Context,
	email,
	name,
	role,
	password string,
) (userservice.User, error) {
	return s.userService.RegisterNewUser(ctx, email, name, role, password)
}

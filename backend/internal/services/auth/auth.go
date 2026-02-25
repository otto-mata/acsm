package authservice

import (
	apiutils "acsm/internal/api/utils"
	configservice "acsm/internal/services/config"
	cryptoservice "acsm/internal/services/crypto"
	jwtservice "acsm/internal/services/jwt"
	userservice "acsm/internal/services/user"
	"context"

	"github.com/samber/do"
)

type AuthService interface {
	AuthenticateUser(
		ctx context.Context, email, password string) (userservice.User, error)
	RegisterUser(
		ctx context.Context, email, name, role, password string) (userservice.User, error)
	RefreshUser(
		ctx context.Context,
		refreshToken string,
	) (string, error)
	Logout(
		ctx context.Context,
	) error
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

	hash, err := cryptoservice.HashPassword(password)
	if err != nil {
		return userservice.User{}, err
	}
	return s.userService.CreateUser(ctx, email, name, role, hash)
}

func (s *authService) RefreshUser(
	ctx context.Context,
	refreshToken string,
) (string, error) {
	if err := s.jwtService.ValidateRefreshToken(ctx, refreshToken); err != nil {
		return "", err
	}
	claims, err := apiutils.GetClaims(ctx)
	if err != nil {
		return "", err
	}
	return s.jwtService.GenerateAccessToken(ctx, claims.UserID, claims.Role)
}

func (s *authService) Logout(
	ctx context.Context,
) error {

	claims, err := apiutils.GetClaims(ctx)
	if err != nil {
		return err
	}
	return s.userService.RemoveRefreshToken(ctx, claims.UserID)
}

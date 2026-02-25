package userservice

import (
	configservice "acsm/internal/services/config"
	cryptoservice "acsm/internal/services/crypto"
	databaseservice "acsm/internal/services/database"
	jwtservice "acsm/internal/services/jwt"
	"acsm/internal/store"
	"context"

	"github.com/samber/do"
)

type UserService interface {
	GetUserByEmail(ctx context.Context, email string) (User, error)
	CheckPasswordForUserWithEmail(ctx context.Context, email, password string) (User, error)
	RegisterNewUser(ctx context.Context, email, name, role, password string) (User, error)
}

type userService struct {
	config     configservice.Config
	dbService  *store.Queries
	jwtService jwtservice.JWTService
}

func NewProvider() func(i *do.Injector) (UserService, error) {
	return func(i *do.Injector) (UserService, error) {
		return New(
			do.MustInvoke[configservice.ConfigService](i),
			do.MustInvoke[*store.Queries](i),
			do.MustInvoke[jwtservice.JWTService](i),
		)
	}
}

func New(
	configService configservice.ConfigService,
	dbService databaseservice.DatabaseService,
	jwtService jwtservice.JWTService,
) (UserService, error) {
	config := configService.GetConfig()
	return &userService{
		config:     config,
		dbService:  dbService,
		jwtService: jwtService,
	}, nil
}

func (s *userService) GetUserByEmail(ctx context.Context, email string) (User, error) {
	user, err := s.dbService.GetUserByEmail(ctx, email)
	if err != nil {
		return User{}, err
	}
	return User{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
		Role:  user.Role,
	}, nil
}

func (s *userService) CheckPasswordForUserWithEmail(ctx context.Context,
	email,
	password string,
) (User, error) {
	user, err := s.dbService.GetUserByEmail(ctx, email)
	if err != nil {
		return User{}, err
	}
	err = cryptoservice.CheckPassword(user.HashedPassword, password)
	if err != nil {
		return User{}, err
	}
	return User{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
		Role:  user.Role,
	}, nil
}

func (s *userService) RegisterNewUser(
	ctx context.Context,
	email,
	name,
	role,
	password string,
) (User, error) {
	hash, err := cryptoservice.HashPassword(password)
	if err != nil {
		return User{}, err
	}
	dbuser, err := s.dbService.CreateUser(ctx, store.CreateUserParams{
		Name:           name,
		Email:          email,
		HashedPassword: hash,
		Role:           role,
	})
	return User{
		ID:    dbuser.ID,
		Name:  dbuser.Name,
		Email: dbuser.Email,
		Role:  dbuser.Role,
	}, err

}

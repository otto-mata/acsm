package userservice

import (
	configservice "acsm/internal/services/config"
	cryptoservice "acsm/internal/services/crypto"
	databaseservice "acsm/internal/services/database"
	"acsm/internal/store"
	"acsm/internal/utils"
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/samber/do"
)

type UserService interface {
	GetUserByEmail(ctx context.Context, email string) (User, error)
	CheckPasswordForUserWithEmail(ctx context.Context, email, password string) (User, error)
	CreateUser(ctx context.Context, email, name, role, password string) (User, error)
	RemoveRefreshToken(ctx context.Context, userID uuid.UUID) error
	ListUsers(ctx context.Context) ([]User, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (User, error)
	UpdateUser(ctx context.Context, id uuid.UUID, name, role string) error
	DeleteUser(ctx context.Context, id uuid.UUID) error
}

type userService struct {
	config    configservice.Config
	dbService *store.Queries
}

func NewProvider() func(i *do.Injector) (UserService, error) {
	return func(i *do.Injector) (UserService, error) {
		return New(
			do.MustInvoke[configservice.ConfigService](i),
			do.MustInvoke[*store.Queries](i),
		)
	}
}

func New(
	configService configservice.ConfigService,
	dbService databaseservice.DatabaseService,
) (UserService, error) {
	config := configService.GetConfig()
	return &userService{
		config:    config,
		dbService: dbService,
	}, nil
}

func (s *userService) GetUserByEmail(ctx context.Context, email string) (User, error) {
	user, err := s.dbService.GetUserByEmail(ctx, email)
	if err != nil {
		return User{}, err
	}
	return StoreToBusinessUser(user), nil
}
func (s *userService) GetUserByID(ctx context.Context, id uuid.UUID) (User, error) {
	user, err := s.dbService.GetUserByID(ctx, id)
	if err != nil {
		return User{}, err
	}
	return StoreToBusinessUser(user), nil
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
	return StoreToBusinessUser(user), nil
}

func (s *userService) CreateUser(
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
	return StoreToBusinessUser(dbuser), err

}

func (s *userService) RemoveRefreshToken(
	ctx context.Context,
	userID uuid.UUID,
) error {
	return s.dbService.RemoveRefreshToken(ctx, userID)
}

func (s *userService) ListUsers(ctx context.Context) ([]User, error) {
	dbusers, err := s.dbService.GetAllUsers(ctx)
	if err != nil {
		return nil, err
	}
	return utils.Map(dbusers, StoreToBusinessUser), nil
}

func (s *userService) UpdateUser(ctx context.Context, id uuid.UUID, name, role string) error {
	_, err := s.dbService.UpdateUser(ctx, store.UpdateUserParams{
		ID:   id,
		Name: pgtype.Text{String: name, Valid: name != ""},
		Role: pgtype.Text{String: role, Valid: role != ""},
	})
	return err
}

func (s *userService) DeleteUser(ctx context.Context, id uuid.UUID) error {
	return s.dbService.DeleteUser(ctx, id)
}

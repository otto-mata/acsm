package jwtservice

import (
	configservice "acsm/internal/services/config"
	cryptoservice "acsm/internal/services/crypto"
	"acsm/internal/store"
	"context"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/samber/do"
)

type JWTService interface {
	GenerateAccessToken(ctx context.Context, userID uuid.UUID, role string) (string, error)
	GenerateRefreshToken(ctx context.Context, userID uuid.UUID) (string, error)
	ValidateAccessToken(tokenString string) (*AccessClaims, error)
	ValidateRefreshToken(ctx context.Context, tokenString string) error
}

type jwtService struct {
	config          configservice.Config
	databaseService *store.Queries
}

type AccessClaims struct {
	UserID uuid.UUID `json:"user_id"`
	Role   string    `json:"role"`
	jwt.RegisteredClaims
}

func NewProvider() func(i *do.Injector) (JWTService, error) {
	return func(i *do.Injector) (JWTService, error) {
		return New(
			do.MustInvoke[configservice.ConfigService](i),
			do.MustInvoke[*store.Queries](i),
		)
	}
}

func New(
	configService configservice.ConfigService,
	databaseService *store.Queries,
) (JWTService, error) {
	config := configService.GetConfig()
	return &jwtService{
		config:          config,
		databaseService: databaseService,
	}, nil
}

// GenerateAccessToken creates a short-lived signed JWT
func (s *jwtService) GenerateAccessToken(ctx context.Context, userID uuid.UUID, role string) (string, error) {
	tokenID := uuid.New()
	claims := AccessClaims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID.String(),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			ID:        tokenID.String(),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(s.config.AccessTokenTTLMin) * time.Minute)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.config.JWTSecret))
}

// GenerateRefreshToken creates a long-lived signed JWT
func (s *jwtService) GenerateRefreshToken(ctx context.Context, userID uuid.UUID) (string, error) {
	claims := jwt.RegisteredClaims{
		Subject:   userID.String(),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		NotBefore: jwt.NewNumericDate(time.Now()),
		ID:        uuid.NewString(),
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(s.config.RefreshTokenTTLDay) * time.Hour * 24)),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	refresh, err := token.SignedString([]byte(s.config.JWTSecret))
	if err != nil {
		return "", err
	}
	hash, err := cryptoservice.HashSha256(refresh)
	if err != nil {
		return "", nil
	}
	storedRefresh, err := s.databaseService.CreateRefreshToken(ctx,
		store.CreateRefreshTokenParams{
			UserID: userID,
			ExpiresAt: pgtype.Timestamp{
				Time:             claims.ExpiresAt.Time,
				InfinityModifier: pgtype.Finite,
				Valid:            true,
			},
			TokenHash: hash,
		},
	)
	if err != nil {
		return "", err
	}
	if storedRefresh.UserID != userID {
		return "", fmt.Errorf("mismatch UserID")
	}
	return refresh, nil
}

// ValidateAccessToken parses and validates a JWT string, returns Claims or error
func (s *jwtService) ValidateAccessToken(tokenString string) (*AccessClaims, error) {
	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected method: %s", t.Method.Alg())
		}
		return []byte(s.config.JWTSecret), nil
	})
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}
	return &AccessClaims{
		UserID: uuid.MustParse(claims["user_id"].(string)),
		Role:   claims["role"].(string),
	}, nil
}

func (s *jwtService) ValidateRefreshToken(ctx context.Context, tokenString string) error {
	refresh, err := jwt.Parse(tokenString, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected method: %s", t.Method.Alg())
		}
		return []byte(s.config.JWTSecret), nil
	})
	if err != nil {
		return err
	}
	sub, err := refresh.Claims.GetSubject()
	if err != nil {
		return err
	}
	userId, err := uuid.Parse(sub)
	if err != nil {
		return err
	}
	stored, err := s.databaseService.GetRefreshToken(ctx, userId)
	if err != nil {
		return err
	}
	hash, err := cryptoservice.HashSha256(tokenString)
	if err != nil {
		return err
	}
	if hash != stored.TokenHash {
		return fmt.Errorf("no refresh token for user")
	}
	return nil
}

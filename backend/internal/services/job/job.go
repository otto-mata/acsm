package jobservice

import (
	"acsm/internal/domain"
	configservice "acsm/internal/services/config"
	databaseservice "acsm/internal/services/database"
	"acsm/internal/store"
	"acsm/internal/utils"
	"context"
	"encoding/json"
	"log"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/samber/do"
)

type JobService interface {
	CreateJob(ctx context.Context, creatorID uuid.UUID, params domain.CreateJobParams) (domain.Job, error)
	GetJob(ctx context.Context, id uuid.UUID) (domain.Job, error)
	ListJobs(ctx context.Context, filter domain.ListJobsFilters) ([]domain.Job, error)
	UpdateJob(ctx context.Context, id uuid.UUID, params domain.UpdateJobParams) (domain.Job, error)
	DeleteJob(ctx context.Context, id uuid.UUID) error
}
type jobService struct {
	config    configservice.Config
	dbService *store.Queries
}

func NewProvider() func(i *do.Injector) (JobService, error) {
	return func(i *do.Injector) (JobService, error) {
		return New(
			do.MustInvoke[configservice.ConfigService](i),
			do.MustInvoke[*store.Queries](i),
		)
	}
}

func New(
	configService configservice.ConfigService,
	dbService databaseservice.DatabaseService,
) (JobService, error) {
	config := configService.GetConfig()
	return &jobService{
		config:    config,
		dbService: dbService,
	}, nil
}

func (s *jobService) CreateJob(ctx context.Context, creatorID uuid.UUID, params domain.CreateJobParams) (domain.Job, error) {
	envJson, err := json.Marshal(params.EnvVars)
	if err != nil {
		return domain.Job{}, err
	}
	configJson, err := json.Marshal(params.Config)
	if err != nil {
		return domain.Job{}, err
	}

	args := store.CreateJobParams{
		Name:        params.Name,
		Description: pgtype.Text{String: params.Description, Valid: true},
		Type:        params.Type,
		ScriptPath:  params.ScriptPath,
		Args:        params.Args,
		EnvVars:     envJson,
		Config:      configJson,
		TimeoutSecs: pgtype.Int4{Int32: int32(params.TimeoutSecs), Valid: true},
		CreatedBy:   creatorID,
	}
	dbJob, err := s.dbService.CreateJob(ctx, args)
	if err != nil {
		return domain.Job{}, err
	}
	return StoreToBusiness(dbJob)
}
func (s *jobService) GetJob(ctx context.Context, id uuid.UUID) (domain.Job, error) {
	dbJob, err := s.dbService.GetJobByID(ctx, id)
	if err != nil {
		return domain.Job{}, err
	}
	return StoreToBusiness(dbJob)
}

func (s *jobService) ListJobs(ctx context.Context, filter domain.ListJobsFilters) ([]domain.Job, error) {
	log.Printf("%#v", filter)
	typeFilter := domain.JobType(filter.Type)

	dbJobs, err := s.dbService.ListJobs(
		ctx,
		store.ListJobsParams{
			Offset: int32(filter.Offset),
			Limit:  int32(filter.Limit),
			Type:   pgtype.Text{String: typeFilter.ToString(), Valid: typeFilter.IsValid()},
		},
	)
	if err != nil {
		return nil, err
	}
	return utils.Map(dbJobs, MustStoreToBusiness), nil
}
func (s *jobService) UpdateJob(ctx context.Context, id uuid.UUID, params domain.UpdateJobParams) (domain.Job, error) {
	job, err := s.dbService.UpdateJob(ctx, store.UpdateJobParams{
		ID:          id,
		Name:        pgtype.Text{String: params.Name, Valid: params.Name != ""},
		Description: pgtype.Text{String: params.Description, Valid: params.Description != ""},
	})
	if err != nil {
		return domain.Job{}, err
	}
	return StoreToBusiness(job)
}
func (s *jobService) DeleteJob(ctx context.Context, id uuid.UUID) error {
	return s.dbService.DeleteJob(ctx, id)
}

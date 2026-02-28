package jobservice

import (
	"acsm/internal/api/domain"
	configservice "acsm/internal/services/config"
	databaseservice "acsm/internal/services/database"
	"acsm/internal/store"
	"context"

	"github.com/google/uuid"
	"github.com/samber/do"
)

type createJobParams struct {
	Name        string         `json:"name"`
	Description string         `json:"description"`
	Type        string         `json:"type"`
	ScriptPath  string         `json:"script_path"`
	Args        []string       `json:"args"`
	EnvVars     map[string]any `json:"env_vars"`
	Config      map[string]any `json:"config"`
	TimeoutSecs int            `json:"timeout_secs"`
}

type listJobsFilters struct {
	Offset int `json:"offset"`
	Limit  int `json:"limit"`
}
type updateJobParams struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type JobService interface {
	CreateJob(ctx context.Context, params createJobParams) (domain.Job, error)
	GetJob(ctx context.Context, id uuid.UUID) (domain.Job, error)
	ListJobs(ctx context.Context, filter listJobsFilters) ([]domain.Job, error)
	UpdateJob(ctx context.Context, id uuid.UUID, params updateJobParams) (domain.Job, error)
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

func (s *jobService) CreateJob(ctx context.Context, params createJobParams) (domain.Job, error) {
	return domain.Job{}, nil
}
func (s *jobService) GetJob(ctx context.Context, id uuid.UUID) (domain.Job, error) {
	return domain.Job{}, nil
}
func (s *jobService) ListJobs(ctx context.Context, filter listJobsFilters) ([]domain.Job, error) {
	return []domain.Job{}, nil
}
func (s *jobService) UpdateJob(ctx context.Context, id uuid.UUID, params updateJobParams) (domain.Job, error) {
	return domain.Job{}, nil
}
func (s *jobService) DeleteJob(ctx context.Context, id uuid.UUID) error {
	return nil
}

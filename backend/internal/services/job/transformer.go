package jobservice

import (
	"acsm/internal/api/domain"
	"acsm/internal/store"
	"encoding/json"
)

func StoreToBusiness(dbJob store.Job) (domain.Job, error) {
	var env map[string]string
	if err := json.Unmarshal(dbJob.EnvVars, &env); err != nil {
		return domain.Job{}, err
	}
	var cfg map[string]any
	if err := json.Unmarshal(dbJob.Config, &cfg); err != nil {
		return domain.Job{}, err
	}
	var timeout *int = nil
	if dbJob.TimeoutSecs.Valid {
		*timeout = int(dbJob.TimeoutSecs.Int32)
	}
	return domain.Job{
		ID:          dbJob.ID,
		Name:        dbJob.Name,
		Description: dbJob.Description.String,
		Type:        domain.JobType(dbJob.Type),
		ScriptPath:  dbJob.ScriptPath,
		Args:        dbJob.Args,
		EnvVars:     env,
		Config:      cfg,
		TimeoutSecs: timeout,
		CreatedBy:   dbJob.CreatedBy,
		CreatedAt:   dbJob.CreatedAt,
		UpdatedAt:   dbJob.UpdatedAt,
	}, nil
}

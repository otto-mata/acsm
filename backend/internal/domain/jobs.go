package domain

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

type JobType string

const (
	JobTypeFileProcessing JobType = "file_processing"
	JobTypeScheduledTask  JobType = "scheduled_task"
	JobTypeTriggeredTask  JobType = "triggered_task"
)

type Job struct {
	ID          uuid.UUID         `json:"id"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	Type        JobType           `json:"type"`
	ScriptPath  string            `json:"script_path"`
	Args        []string          `json:"args"`
	EnvVars     map[string]string `json:"env_vars"`
	Config      map[string]any    `json:"config"`
	TimeoutSecs *int              `json:"timeoutsecs"`
	CreatedBy   uuid.UUID         `json:"created_by"`
	CreatedAt   time.Time         `json:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at"`
}

type CreateJobParams struct {
	Name        string            `json:"name" validate:"required"`
	Description string            `json:"description" validate:"required"`
	Type        string            `json:"type" validate:"oneof=file_processing scheduled_task triggered_task"`
	ScriptPath  string            `json:"script_path" validate:"required"`
	Args        []string          `json:"args omitempty"`
	EnvVars     map[string]string `json:"env_vars omitempty"`
	Config      map[string]string `json:"config omitempty"`
	TimeoutSecs int               `json:"timeout_secs omitempty"`
}

type ListJobsFilters struct {
	Offset int    `json:"offset"`
	Limit  int    `json:"limit"`
	Type   string `json:"type"`
}
type UpdateJobParams struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

func (j *JobType) IsValid() bool {
	return *j == JobTypeFileProcessing || *j == JobTypeScheduledTask || *j == JobTypeTriggeredTask
}
func (j *JobType) ToString() string {
	return string(*j)
}

func (j *Job) Validate() error {
	if j.Name == "" {
		return fmt.Errorf("name must not be empty")
	}
	if j.Description == "" {
		return fmt.Errorf("description must not be empty")
	}
	if !j.Type.IsValid() {
		return fmt.Errorf("invalid job type")
	}
	if j.ScriptPath == "" {
		return fmt.Errorf("script path must not be empty")
	}
	return nil
}

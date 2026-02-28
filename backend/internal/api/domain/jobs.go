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
	ID          uuid.UUID
	Name        string
	Description string
	Type        JobType
	ScriptPath  string
	Args        []string
	EnvVars     map[string]string
	Config      map[string]any
	TimeoutSecs *int
	CreatedBy   uuid.UUID
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (j *JobType) IsValid() bool {
	return *j == JobTypeFileProcessing || *j == JobTypeScheduledTask || *j == JobTypeTriggeredTask
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

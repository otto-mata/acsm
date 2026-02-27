CREATE TABLE IF NOT EXISTS jobs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT NOT NULL,
    description  TEXT,
    type         TEXT NOT NULL CHECK (type IN ('file_processing', 'scheduled_task', 'triggered_task')),
    script_path  TEXT NOT NULL,
    args         TEXT[],
    env_vars     JSONB NOT NULL DEFAULT '{}',
    config       JSONB NOT NULL DEFAULT '{}',
    timeout_secs INT,
    created_by   UUID NOT NULL REFERENCES users(id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX jobs_type_idx ON jobs(type);
CREATE INDEX jobs_created_by_idx ON jobs(created_by);

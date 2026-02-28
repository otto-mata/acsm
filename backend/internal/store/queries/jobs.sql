-- name: CreateJob :one
INSERT INTO jobs (
    name, description, type, script_path, args, env_vars, config, timeout_secs, created_by
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9
)
RETURNING *;

-- name: GetJobByID :one
SELECT * FROM jobs
WHERE id = $1 LIMIT 1;

-- name: ListJobs :many
SELECT * FROM jobs
WHERE (sqlc.narg('type')::text IS NULL OR type = sqlc.narg('type') )
ORDER BY created_at DESC
LIMIT $1
OFFSET $2;

-- name: UpdateJob :one
UPDATE jobs
set
 name = coalesce(sqlc.narg('name'), name),
 description = coalesce(sqlc.narg('description'), description)
WHERE id = $1
RETURNING *;

-- name: DeleteJob :exec
DELETE FROM jobs
WHERE id = $1;

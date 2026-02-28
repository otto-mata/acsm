-- name: CreateUser :one
INSERT INTO users (
    name, email, hashed_password, role
) VALUES (
    $1, $2, $3, $4
)
RETURNING *;

-- name: DeleteUser :exec
DELETE FROM users
WHERE id = $1;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1 LIMIT 1;

-- name: GetUserByID :one
SELECT * FROM users
WHERE id = $1 LIMIT 1;

-- name: ListUsers :many
SELECT * FROM users
ORDER BY created_at;

-- name: UpdateUser :one
UPDATE users
set
 name = coalesce(sqlc.narg('name'), name),
 role = coalesce(sqlc.narg('role'), role)
WHERE id = $1
RETURNING *;

-- name: GetAllUsers :many
SELECT * FROM users;

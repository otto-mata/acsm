# Assetto Corsa Server Manager (ACSM)

## Setup for dev

Database:

```bash
docker compose -f compose.dev.yml postgres
make migrate-up
```

Backend:

```bash
cd backend
cp .env.example .env
go run ./cmd/seed
# ...
go run ./cmd/api
```

Fontend:

```bash
cd frontend
cp .env.local.example .env.local
npm run ci
npm run dev
```

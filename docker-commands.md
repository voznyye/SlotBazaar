# Docker Commands for SlotBazaar

## Quick Start

### SQLite version (simple, for development)
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f app
```

### PostgreSQL version (full, for production)
```bash
# Start
docker-compose --profile postgres up -d

# Stop
docker-compose --profile postgres down

# Logs
docker-compose --profile postgres logs -f app-postgres

# Database logs
docker-compose --profile postgres logs -f db
```

## Application Access

### SQLite version
- API: http://localhost:8003
- Swagger UI: http://localhost:8003/docs
- Redoc: http://localhost:8003/redoc

### PostgreSQL version
- API: http://localhost:8004
- Swagger UI: http://localhost:8004/docs
- Redoc: http://localhost:8004/redoc
- Adminer (DB Admin): http://localhost:8080

## Adminer Connection

**Connection details:**
- System: `PostgreSQL`
- Server: `db`
- Username: `slotbazaar_user`
- Password: `slotbazaar_password`
- Database: `slotbazaar`

## Useful Commands

### Rebuild containers
```bash
# SQLite
docker-compose up --build -d

# PostgreSQL
docker-compose --profile postgres up --build -d
```

### View status
```bash
# SQLite
docker-compose ps

# PostgreSQL
docker-compose --profile postgres ps
```

### Clean data
```bash
# Stop and remove containers
docker-compose --profile postgres down

# Remove volumes (WARNING: will delete all data!)
docker-compose --profile postgres down -v
```

### Connect to container
```bash
# Connect to application
docker exec -it slotbazaar_app_postgres bash

# Connect to database
docker exec -it slotbazaar_db psql -U slotbazaar_user -d slotbazaar
```

## Migrations

### Create new migration
```bash
# Connect to container
docker exec -it slotbazaar_app_postgres bash

# Create migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head
```

## API Testing

### Quick test
```powershell
# Check API status
$response = Invoke-RestMethod -Uri "http://localhost:8004/" -Method GET
Write-Host $response.message
```

### Full test
```powershell
# Registration
$registerBody = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod -Uri "http://localhost:8004/auth/register" -Method POST -Body $registerBody -ContentType "application/json"

# Login
$loginBody = @{
    username = "testuser"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:8004/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.access_token
$headers = @{ "Authorization" = "Bearer $token" }

# Deposit
$depositBody = @{ amount = "100.00" } | ConvertTo-Json
$depositResponse = Invoke-RestMethod -Uri "http://localhost:8004/auth/deposit" -Method POST -Body $depositBody -ContentType "application/json" -Headers $headers

# Game
$gameBody = @{ bet = "10.00"; choice = "heads" } | ConvertTo-Json
$gameResponse = Invoke-RestMethod -Uri "http://localhost:8004/games/coin/flip" -Method POST -Body $gameBody -ContentType "application/json" -Headers $headers
```

## Monitoring

### View resources
```bash
docker stats
```

### View logs in real-time
```bash
# PostgreSQL application
docker-compose --profile postgres logs -f app-postgres

# Database
docker-compose --profile postgres logs -f db

# All services
docker-compose --profile postgres logs -f
```

# SlotBazaar Casino Platform - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Game Implementations](#game-implementations)
4. [Backend API](#backend-api)
5. [Database Schema](#database-schema)
6. [Services Layer](#services-layer)
7. [Authentication System](#authentication-system)
8. [Frontend Structure](#frontend-structure)
9. [Deployment Configuration](#deployment-configuration)
10. [Testing & Quality Assurance](#testing--quality-assurance)
11. [Maintenance & Operations](#maintenance--operations)

## Project Overview

SlotBazaar is a modular casino gaming platform featuring:
- 10+ provably fair casino games
- JWT-based authentication system
- Real-time balance management
- Transaction tracking system
- Game session history
- Responsive React frontend

**Technical Stack:**
- **Backend:** Python 3.10+, FastAPI, SQLAlchemy 1.4+
- **Database:** PostgreSQL 14+ (production), SQLite (development)
- **Frontend:** React 18+, Material-UI 5+, Framer Motion
- **Auth:** JWT with HTTPBearer
- **Numerics:** Python Decimal for financial calculations
- **Security:** Secrets module for cryptographic randomness

## System Architecture

```mermaid
graph TD
    A[React Frontend] --> B[FastAPI Backend]
    B --> C[PostgreSQL Database]
    B --> D[Game Modules]
    C --> E[User Data]
    C --> F[Transaction Records]
    C --> G[Game Sessions]
    D --> H[Provably Fair Algorithms]
```

Key Architectural Patterns:
1. **Layered Architecture:** Presentation -> Application -> Domain -> Infrastructure
2. **Modular Game Design:** Independent game modules with standardized interfaces
3. **CQRS Pattern:** Separate read/write models for transactions
4. **JWT Stateless Authentication:** Token-based session management
5. **Financial Safety:** Decimal arithmetic for all monetary calculations

## Game Implementations

### Common Game Interface
All games implement:
```python
def play_game(bet: decimal.Decimal, *args) -> Dict[str, Union[str, decimal.Decimal]]:
    """
    Returns:
    {
        'game': str,
        'bet': decimal.Decimal,
        'winnings': decimal.Decimal,
        'net_win_loss': decimal.Decimal,
        # Game-specific fields
    }
    """
```

### Game Matrix

| Game | RTP | Parameters | Payout Calculation | Special Features |
|------|-----|------------|--------------------|------------------|
| Coin Flip | 96% | Choice: Heads/Tails | 1.92x on win | Binary outcome |
| Dice Roll | 95% | Number: 1-6 | 5.7x on win | 6-sided die simulation |
| High/Low Card | 96% | Choice: High/Low | 2.08x (Low), 1.78x (High) | Card value comparison |
| Number Guess | 95% | Number: 1-10 | 9.5x on win | 10:1 odds game |
| 3-Reel Slot | 96.3% | None | Paytable-based (5x-13x) | Symbol combinations |
| Rock Paper Scissors | 97% | Choice: R/P/S | 1.91x on win | House vs player |
| Scratch Card | 96% | Fixed $1 bet | Probability distribution | Instant win |
| Roulette | 97.3% | Color: Red/Black | 2x on win | European wheel |
| Blackjack | 97.3% | None | 2x (win), 1x (push) | Simplified rules |
| Wheel of Fortune | 95% | None | Segment-based (0-3x) | 10-segment wheel |

### Algorithm Details
**Card Games:**
```python
# High/Low Card value calculation
RANK_VALUES = {'2': 2, '3': 3, ..., 'A': 13}
LOW_THRESHOLD = 7  # 2-7 considered Low
```

**Provable Fairness:**
```python
# Using cryptographically secure RNG
outcome = secrets.choice(CHOICES)  # Not pseudo-random
```

**Slot Machine Logic:**
```python
PAYTABLE = {
    ('C', 'C', 'C'): decimal.Decimal('5'),
    ('L', 'L', 'L'): decimal.Decimal('8'),
    ('B', 'B', 'B'): decimal.Decimal('13'),
}
```

## Backend API

### Base URL
`https://api.slotbazaar.com/v1`

### Authentication
```http
POST /api/auth/login
Content-Type: application/json

{
    "username": "player1",
    "password": "securePassword123"
}
```

### Game Endpoints
```http
POST /api/games/coin/play
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
    "bet": 10.00,
    "choice": "Heads"
}
```

**Response:**
```json
{
    "game": "Coin Flip",
    "outcome": "Heads",
    "winnings": 19.20,
    "net_win_loss": 9.20,
    "new_balance": 109.20
}
```

### Error Handling
Standard error responses:
```json
{
    "detail": {
        "code": "INSUFFICIENT_FUNDS",
        "message": "Insufficient balance to place bet"
    }
}
```

Common error codes:
- `AUTH_REQUIRED`: 401 Unauthorized
- `INVALID_BET`: 400 Bad Request
- `GAME_RULE_VIOLATION`: 422 Unprocessable Entity
- `SERVER_ERROR`: 500 Internal Server Error

## Database Schema

### Core Models

```mermaid
erDiagram
    USERS ||--o{ TRANSACTIONS : has
    USERS ||--o{ GAME_SESSIONS : has
    GAME_SESSIONS ||--o{ TRANSACTIONS : has

    USERS {
        int id PK
        string username
        string email
        string hashed_password
        decimal balance
        bool is_active
        bool is_verified
        datetime created_at
        datetime updated_at
    }
    
    TRANSACTIONS {
        int id PK
        int user_id FK
        enum type
        enum status
        decimal amount
        decimal balance_before
        decimal balance_after
        int game_session_id FK
    }
    
    GAME_SESSIONS {
        int id PK
        int user_id FK
        string game_type
        decimal bet_amount
        decimal win_amount
        json game_data
    }
```

### Enumerations
**Transaction Types:**
```python
class TransactionType(enum.Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    BET = "bet"
    WIN = "win"
    BONUS = "bonus"
    REFUND = "refund"
```

**Transaction Statuses:**
```python
class TransactionStatus(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
```

## Services Layer

### UserService
```python
class UserService:
    def create_user(self, user_data: UserCreate) -> User:
        """Creates user with hashed password and initial balance"""
    
    def update_balance(self, user_id: int, amount: Decimal, 
                     transaction_type: TransactionType) -> Transaction:
        """Atomic balance update with transaction record"""
```

### GameService
```python
class GameService:
    def create_game_session(self, user_id: int, game_type: str,
                          bet_amount: Decimal, winnings: Decimal) -> GameSession:
        """Creates complete game session with transactions"""
```

### Financial Safety Mechanisms
1. **Decimal Precision:**
   ```python
   decimal.getcontext().prec = 10
   bet = decimal.Decimal('10.00')  # Never use floats
   ```
2. **Transaction Isolation:**
   ```python
   with db.begin():
       # Deduct bet
       # Create game session
       # Add winnings if applicable
   ```
3. **Balance Checks:**
   ```python
   if user.balance < bet_amount:
       raise HTTPException(400, "Insufficient balance")
   ```

## Authentication System

### JWT Configuration
```python
# .env
JWT_SECRET_KEY="super_secret_key_here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
```

### Token Flow
1. Client authenticates with username/password
2. Server returns JWT access token
3. Client includes token in Authorization header
4. Protected endpoints verify token signature and claims

### Security Features
- Password hashing with bcrypt
- Token expiration (30 minutes)
- Secure cookie handling
- CSRF protection on state-changing operations

## Frontend Structure

### Component Hierarchy
```
src/
├── components/
│   ├── GameAnimations/
│   ├── GameTemplate/
│   ├── Layout/
│   └── NavBar/
├── pages/
│   ├── games/
│   │   ├── CoinFlip.js
│   │   └── ... 
│   ├── Dashboard.js
│   ├── Transactions.js
│   └── ...
└── contexts/
    └── AuthContext.js
```

### Key Technologies
1. **State Management:** React Context API
2. **Styling:** Material-UI with custom theme
3. **Animations:** Framer Motion
4. **HTTP Client:** Axios with interceptors
5. **Form Handling:** React Hook Form

### Game Animation System
```javascript
function GameAnimations({ result, winnings }) {
    // Particle effects for wins
    // Smooth transitions for game states
    // Custom animations per game type
}
```

## Deployment Configuration

### Environment Variables
```bash
# .env.production
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
JWT_SECRET_KEY="cryptographically_secure_random"
DEBUG="False"
ALLOWED_ORIGINS="https://slotbazaar.com"
```

### Database Setup
```bash
# Initialize database
alembic upgrade head

# Run migrations
python scripts/create_tables.py
```

### Production Stack
- **Web Server:** Uvicorn + Gunicorn
- **Reverse Proxy:** Nginx
- **Database:** PostgreSQL with connection pooling
- **Cache:** Redis for session storage
- **Monitoring:** Prometheus + Grafana

## Testing & Quality Assurance

### Test Pyramid
1. **Unit Tests:** Game logic, utility functions
2. **Integration Tests:** API endpoints with database
3. **E2E Tests:** Full user flows with Cypress

### Example API Test
```python
def test_coin_flip_win():
    client = TestClient(app)
    token = authenticate_user(client)
    
    response = client.post(
        "/api/games/coin/play",
        json={"bet": 10, "choice": "Heads"},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "outcome" in data
    assert data["balance"] >= 0
```

### Security Audits
1. Static code analysis (Bandit, Semgrep)
2. Dependency scanning (Snyk)
3. Penetration testing quarterly
4. Financial transaction audits

## Maintenance & Operations

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Monitoring Endpoints
- `/health`: Service health check
- `/metrics`: Prometheus metrics
- `/docs`: Interactive API documentation

### Backup Strategy
1. **Daily Snapshots:** Full database backups
2. **WAL Archiving:** Continuous write-ahead logs
3. **Offsite Storage:** Encrypted backups in S3
4. **Disaster Recovery:** Point-in-time recovery

## Contributor Guidelines

### Development Setup
```bash
# Clone repository
git clone https://github.com/slotbazaar/casino-platform.git

# Install dependencies
pip install -r requirements.txt
npm install

# Start development servers
uvicorn app.main:app --reload
npm start
```

### Code Standards
1. **Python:** PEP-8 with Black formatting
2. **JavaScript:** Airbnb style guide
3. **Commits:** Conventional commits
4. **Documentation:** Update README.md for new features

### Pull Request Checklist
- [ ] Unit tests added/updated
- [ ] Documentation updated
- [ ] Migration files created
- [ ] Security review completed
- [ ] End-to-end tests passed

---

This documentation provides a comprehensive technical overview of the SlotBazaar casino platform. For implementation details of specific components, refer to the inline documentation in each source file.
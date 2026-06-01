# QUANTUM EVEN/ODD TRADER V3.0 - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  │  Web Dashboard   │  │   Admin Panel    │  │    Mobile PWA    │
│  │   (Next.js)      │  │   (Next.js)      │  │    (Next.js)      │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
│           │                      │                      │
└───────────┼──────────────────────┼──────────────────────┼─────────┘
            │                      │                      │
┌───────────┼──────────────────────┼──────────────────────┼─────────┐
│           └──────────────────────┼──────────────────────┘         │
│                                  ▼                                 │
│                    ┌──────────────────────────┐                   │
│                    │   API Gateway (Express)  │                   │
│                    │   Rate Limiting / JWT    │                   │
│                    │   CORS / Security        │                   │
│                    └────────┬─────────────────┘                   │
│                             │                                      │
│           ┌─────────────────┼─────────────────┐                   │
│           ▼                 ▼                 ▼                   │
│     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│     │   Deriv      │ │   Strategy   │ │    Risk      │           │
│     │   Gateway    │ │   Engine     │ │   Engine     │           │
│     │ (WebSocket)  │ │ (Analysis)   │ │ (Protection) │           │
│     └──────┬───────┘ └──────┬───────┘ └──────┬───────┘           │
│            │                │                │                    │
│            └────────────────┼────────────────┘                    │
│                             ▼                                      │
│                    ┌──────────────────────┐                       │
│                    │  Execution Engine    │                       │
│                    │  (Trade Execution)   │                       │
│                    └─────────┬────────────┘                       │
│                              │                                     │
│              ┌───────────────┼───────────────┐                    │
│              ▼               ▼               ▼                    │
│         ┌─────────┐      ┌────────┐    ┌──────────┐             │
│         │PostgreSQL│     │ Redis  │    │ Deriv    │             │
│         │(Primary)│      │(Cache) │    │(External)│             │
│         └─────────┘      └────────┘    └──────────┘             │
│                                                                   │
│              BACKEND SERVICES (Scalable)                          │
└───────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. API Gateway
- **Technology:** Express.js + TypeScript
- **Port:** 3001
- **Responsibilities:**
  - JWT authentication & authorization
  - Rate limiting (100 req/15min)
  - CORS & security headers
  - Request validation
  - Error handling

### 2. Deriv Gateway
- **WebSocket Connection** to Deriv broker
- **Auto-reconnect** with exponential backoff
- **Tick streaming** (R_10 synthetic index)
- **Contract lifecycle** management
- **Secure token** handling (encrypted storage)

### 3. Strategy Engine
**Input:** Live tick data
**Process:**
1. Pattern analysis (last 5/10/20 digits)
2. Even/Odd dominance calculation
3. Entropy & randomness scoring
4. Confidence calculation (0-100%)
5. Market state classification

**Output:** BUY EVEN / BUY ODD signals with confidence

### 4. Risk Engine
**Input:** Strategy signals
**Checks:**
1. Minimum confidence (70% threshold)
2. Daily profit target (+10%)
3. Daily stop loss (-5%)
4. Consecutive losses (max 2)
5. Account drawdown (max 15%)

**Recovery Mode:**
- Loss #1: -20% stake reduction
- Loss #2: -40% stake reduction
- Loss #3+: Trading pause

**Output:** APPROVE / BLOCK with reasons

### 5. Execution Engine
**Input:** Risk-approved signals
**Process:**
1. Duplicate prevention check
2. Rate limiting (1 sec between trades)
3. Dynamic stake calculation
4. Contract generation
5. Error recovery

**Output:** Trade confirmation with contract ID

### 6. Data Layer
**PostgreSQL (Primary Store):**
- User accounts & authentication
- Trade history & performance
- Risk logs & audit trails
- Notification logs

**Redis (Cache):**
- Session management
- Rate limiting counters
- Real-time metrics
- Temporary data

**Deriv (External):**
- Live market data
- Contract lifecycle
- Account balance & equity

## Data Flow

### Trade Execution Flow

```
1. TICK RECEIVED
   └─→ TickStream.addTick()
       ├─ Extract digit (quote % 10)
       ├─ Store in circular buffer (max 100)
       └─ Calculate statistics

2. STRATEGY ANALYSIS
   └─→ Strategy.analyze()
       ├─ Check last 5 digits pattern
       ├─ Calculate even/odd dominance
       ├─ Measure randomness & stability
       ├─ Generate confidence score
       └─ Return signal (EVEN/ODD or NONE)

3. RISK VALIDATION
   └─→ RiskManager.getRiskState()
       ├─ Check daily drawdown
       ├─ Check daily profit target
       ├─ Check consecutive losses
       ├─ Verify drawdown limit
       └─ Return approval status

4. TRADE EXECUTION
   └─→ TradeExecutor.execute()
       ├─ Verify duplicate prevention
       ├─ Check rate limits
       ├─ Calculate dynamic stake
       ├─ Send BUY contract to Deriv
       └─ Log execution & metrics

5. MONITORING
   └─→ Analytics Engine
       ├─ Track performance metrics
       ├─ Update equity curve
       ├─ Generate reports
       └─ Send notifications
```

## Security Architecture

### Authentication & Authorization
- **JWT (Access Token)** - 15 minute expiry
- **Refresh Token** - 7 day expiry
- **Token Encryption** - AES-256-CBC
- **Role-Based Access Control** - Admin/User

### API Security
- **CORS** - Restricted origins
- **Helmet.js** - Security headers
- **Rate Limiting** - 100 req/15min per IP
- **Input Validation** - Strict type checking
- **SQL Injection Prevention** - Parameterized queries

### Data Protection
- **API Token Storage** - Encrypted at rest
- **Password Hashing** - bcryptjs (12 rounds)
- **Audit Logging** - All sensitive operations
- **Secure Logging** - No passwords/tokens logged

### Network Security
- **HTTPS Only** - TLS 1.3+
- **API Key Rotation** - Automatic expiry
- **VPN/Proxy** - For production
- **WAF** - CloudFlare/AWS Shield

## Scalability Strategy

### Horizontal Scaling
```
Load Balancer (Nginx/HAProxy)
        ↓
    ┌───┴───┐
    ▼       ▼
 Backend   Backend
 Instance  Instance
    1        2
    │       │
    └───┬───┘
        ▼
  PostgreSQL (Primary)
        ↓
  Replication ← PostgreSQL (Replica)
```

### Vertical Scaling
- **Node.js:** Multi-core support
- **PostgreSQL:** Connection pooling (20 max)
- **Redis:** Cluster mode for high availability

### Database Optimization
- **Indexes:** Trade user_id, status, timestamp
- **Partitioning:** Trades table by date
- **Archival:** Move old data to cold storage
- **Connection Pooling:** pg-pool with 20 connections

## Performance Metrics

### Targets
- **API Response Time:** < 200ms (p95)
- **Trade Latency:** < 1 second
- **Data Freshness:** < 100ms tick updates
- **Uptime:** 99.9% (SLA)

### Monitoring
- **Prometheus:** Metrics collection
- **Grafana:** Dashboard visualization
- **ELK Stack:** Log aggregation
- **Alert System:** PagerDuty/Slack

## Deployment Options

### Development
```bash
npm install
npm run dev
# Server runs on localhost:3001
```

### Docker
```bash
docker-compose up
# All services start automatically
```

### Kubernetes
```bash
kubectl apply -f k8s/
# Auto-scaling enabled
```

## Disaster Recovery

### Backup Strategy
- **Database:** Daily automated backups (7-day retention)
- **Code:** Git repository (GitHub)
- **Configuration:** Secrets manager (HashiCorp Vault)

### Recovery Time Objectives (RTO)
- **Full outage:** 30 minutes
- **Database failure:** 15 minutes
- **Single service:** 5 minutes

## Compliance & Standards

- **GDPR:** Data privacy compliance
- **PCI DSS:** Payment security (if applicable)
- **SOC 2:** Security controls
- **ISO 27001:** Information security

---

**Last Updated:** June 1, 2026
**Version:** 3.0.0
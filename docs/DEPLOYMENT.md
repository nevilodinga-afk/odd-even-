# QUANTUM EVEN/ODD TRADER V3.0 - Deployment Guide

## Prerequisites

- Node.js 18+ 
- npm 9+
- Docker & Docker Compose (optional)
- PostgreSQL 14+ (or use Docker)
- Redis 7+ (or use Docker)

## Quick Start (Development)

### 1. Clone & Install

```bash
git clone https://github.com/nevilodinga-afk/odd-even-.git
cd odd-even-
npm install
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
cp apps/web-dashboard/.env.example apps/web-dashboard/.env
```

Edit `.env` files with your configuration:
```bash
# backend/.env
DERIV_APP_ID=1089
DATABASE_URL=postgresql://trader:trader_password@localhost:5432/trader
JWT_SECRET=your-secret-key-here
```

### 3. Database Setup

```bash
# Create database
createdb trader

# Run migrations
psql -U trader -d trader -f backend/src/database/schema.sql
```

### 4. Start Services

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd apps/web-dashboard
npm run dev

# Terminal 3: Redis (if not using Docker)
redis-server
```

Backend: http://localhost:3001
Frontend: http://localhost:3000

---

## Docker Deployment

### 1. Build & Run

```bash
docker-compose up --build
```

Services will start:
- **Backend:** http://localhost:3001
- **Frontend:** http://localhost:3000
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379
- **Grafana:** http://localhost:3100 (admin/admin)

### 2. Database Initialization

```bash
docker-compose exec postgres psql -U trader -d trader -f schema.sql
```

### 3. Stop Services

```bash
docker-compose down
```

---

## Kubernetes Deployment

### 1. Prerequisites

```bash
# Install kubectl
brew install kubectl

# Install minikube (local) or use cloud provider
minikube start

# Setup namespace
kubectl create namespace trader
```

### 2. Deploy Backend

```bash
kubectl apply -f infrastructure/kubernetes/backend.yaml -n trader
```

### 3. Deploy Frontend

```bash
kubectl apply -f infrastructure/kubernetes/frontend.yaml -n trader
```

### 4. Deploy Database

```bash
kubectl apply -f infrastructure/kubernetes/postgres.yaml -n trader
kubectl apply -f infrastructure/kubernetes/redis.yaml -n trader
```

### 5. Verify Deployment

```bash
kubectl get pods -n trader
kubectl get services -n trader
```

### 6. Port Forwarding

```bash
kubectl port-forward svc/backend 3001:3001 -n trader
kubectl port-forward svc/frontend 3000:3000 -n trader
```

---

## Production Deployment

### AWS Deployment

#### 1. ECS (Elastic Container Service)

```bash
# Create task definition
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition.json

# Create service
aws ecs create-service \
  --cluster trader \
  --service-name backend \
  --task-definition backend:1 \
  --desired-count 2
```

#### 2. RDS (Database)

```bash
aws rds create-db-instance \
  --db-instance-identifier trader-postgres \
  --engine postgres \
  --db-instance-class db.t3.small \
  --allocated-storage 100
```

#### 3. ElastiCache (Redis)

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id trader-redis \
  --engine redis \
  --cache-node-type cache.t3.micro
```

### GCP Deployment

#### 1. Cloud Run

```bash
gcloud run deploy backend \
  --image gcr.io/project/trader-backend:latest \
  --platform managed \
  --region us-central1
```

#### 2. Cloud SQL (PostgreSQL)

```bash
gcloud sql instances create trader-db \
  --database-version POSTGRES_14 \
  --tier db-f1-micro
```

#### 3. Cloud Memorystore (Redis)

```bash
gcloud redis instances create trader-redis \
  --size=2 \
  --region=us-central1
```

---

## CI/CD Pipeline

### GitHub Actions

The repository includes `.github/workflows/deploy.yml` that:

1. **Tests** - Run unit tests
2. **Builds** - Docker image creation
3. **Pushes** - Registry upload (ECR/GCR)
4. **Deploys** - Kubernetes/ECS deployment

#### Setup

1. Add secrets to GitHub:
   - `DOCKER_REGISTRY_URL`
   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

2. Push to main branch to trigger pipeline

---

## Monitoring & Logging

### Prometheus Metrics

```bash
# Access metrics
curl http://localhost:9090

# Example query
http_requests_total{job="backend"}
```

### Grafana Dashboards

1. Open http://localhost:3100
2. Login: admin / admin
3. Add data source: Prometheus
4. Import dashboards

### ELK Stack (Optional)

```bash
docker-compose -f docker-compose.elk.yml up
```

Access logs: http://localhost:5601 (Kibana)

---

## Health Checks

### Liveness Probe

```bash
curl http://localhost:3001/health
```

### Readiness Probe

```bash
curl http://localhost:3001/ready
```

---

## Environment Variables

### Backend

```env
# Deriv
DERIV_APP_ID=1089
DERIV_WS_URL=wss://ws.derivws.com/websockets/v3

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://localhost:6379

# Server
NODE_ENV=production
PORT=3001

# JWT
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Trading
MIN_CONFIDENCE=70
MAX_CONSECUTIVE_LOSSES=2
RISK_PERCENTAGE=1

# Notifications
TELEGRAM_BOT_TOKEN=your-token
TELEGRAM_CHAT_ID=your-chat-id
```

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

---

## Performance Tuning

### Database

```sql
-- Increase connection pool
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB

-- Add indexes
CREATE INDEX idx_trades_user_timestamp ON trades(user_id, created_at);
```

### Node.js

```bash
# Increase max connections
NODE_OPTIONS="--max-old-space-size=4096"

# Enable clustering
export CLUSTER_ENABLED=true
```

### Redis

```bash
# Increase memory
maxmemory 2gb
maxmemory-policy allkeys-lru
```

---

## Troubleshooting

### Backend Won't Start

```bash
# Check port is available
lsof -i :3001

# Check logs
tail -f logs/app.log

# Verify environment
cat backend/.env
```

### Database Connection Error

```bash
# Test connection
psql -h localhost -U trader -d trader

# Check pool size
SELECT count(*) FROM pg_stat_activity;
```

### High Memory Usage

```bash
# Monitor
docker stats

# Restart container
docker-compose restart backend
```

---

## Backup & Recovery

### Database Backup

```bash
# Full backup
pg_dump -U trader trader > backup.sql

# Compressed backup
pg_dump -U trader trader | gzip > backup.sql.gz
```

### Restore

```bash
# From backup
psql -U trader trader < backup.sql
```

---

## Security Checklist

- [ ] Change default JWT secrets
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure firewall rules
- [ ] Enable audit logging
- [ ] Rotate API keys
- [ ] Set up monitoring alerts
- [ ] Enable database encryption
- [ ] Configure backup retention
- [ ] Document security procedures
- [ ] Test disaster recovery

---

**Last Updated:** June 1, 2026
**Version:** 3.0.0
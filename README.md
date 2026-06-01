# QUANTUM EVEN/ODD TRADER V3.0

**Production-Grade Deriv Even/Odd AI Trading Platform**

## Overview

Quantum Even/Odd Trader V3.0 is an institutional-quality automated trading system for Deriv synthetic indices. Built with Next.js, Node.js, PostgreSQL, Redis, and advanced AI algorithms.

### Key Features

✅ **Secure API Token Authentication**
- JWT + Refresh Token system
- Encrypted secret storage
- Demo & Real account support

✅ **AI Confidence Engine**
- Multi-factor analysis (Pattern, Entropy, Volatility, Momentum)
- Real-time confidence scoring (0-100%)
- Adaptive filtering

✅ **Advanced Risk Management**
- Dynamic stake calculation (0.5%-1% risk per trade)
- AI Recovery Mode (progressive stake reduction)
- Daily stop loss & profit targets
- Maximum drawdown protection

✅ **Multiple Trading Strategies**
- Conservative Reversal
- Entropy Hunter
- Momentum Breaker
- Volatility Compression

✅ **Real-Time Dashboard**
- Live equity tracking
- Performance analytics
- Win rate & drawdown monitoring
- Market state indicators

✅ **Enterprise Infrastructure**
- Docker & Kubernetes support
- Prometheus + Grafana monitoring
- GitHub Actions CI/CD
- PostgreSQL + Redis
- Telegram notifications

## Project Structure

```
quantum-even-odd-trader/
├── apps/
│   ├── web-dashboard/      # Next.js frontend
│   ├── admin-panel/        # Admin interface
│   └── mobile-pwa/         # PWA app
├── services/
│   ├── deriv-gateway/      # WebSocket API integration
│   ├── strategy-engine/    # Trading logic
│   ├── ai-engine/          # AI confidence scoring
│   ├── risk-engine/        # Risk management
│   ├── execution-engine/   # Trade execution
│   ├── analytics-engine/   # Performance tracking
│   └── notification-engine/ # Alerts & notifications
├── database/
│   ├── postgres/           # Schema & migrations
│   └── redis/              # Cache configuration
├── infrastructure/
│   ├── docker/             # Docker configs
│   ├── kubernetes/         # K8s manifests
│   └── ci-cd/              # GitHub Actions
└── monitoring/
    ├── grafana/            # Dashboards
    └── prometheus/         # Metrics
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Docker & Docker Compose (optional)
- PostgreSQL 14+
- Redis 7+

### Installation

```bash
# Clone repository
git clone https://github.com/nevilodinga-afk/odd-even-.git
cd odd-even-

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Run development
npm run dev
```

### With Docker

```bash
npm run docker:up
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - API token login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

### Trading
- `GET /api/trades` - List trades
- `POST /api/trades/execute` - Execute trade
- `GET /api/trades/:id` - Trade details

### Analytics
- `GET /api/analytics/performance` - Performance metrics
- `GET /api/analytics/equity` - Equity curve
- `GET /api/analytics/strategies` - Strategy performance

## Environment Variables

```env
# Deriv API
DERIV_APP_ID=1089
DERIV_WS_URL=wss://ws.derivws.com/websockets/v3

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/trader
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Notifications
TELEGRAM_BOT_TOKEN=your-telegram-token
TELEGRAM_CHAT_ID=your-chat-id
```

## Documentation

- [API Documentation](./docs/API.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Database Schema](./docs/DATABASE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Security Guidelines](./docs/SECURITY.md)

## Risk Disclaimer

⚠️ **IMPORTANT**: Financial markets involve substantial risk. Even/Odd outcomes may be effectively random. No strategy, AI model, indicator, or algorithm can guarantee profits. Past performance does not indicate future results.

Users are responsible for:
- Understanding the risks involved
- Making their own trading decisions
- Managing their own capital
- Complying with local regulations

## License

MIT

## Support

For issues, questions, or suggestions, please open a GitHub issue.

# QUANTUM EVEN/ODD TRADER V3.0 - Backend API Documentation

## Overview

Production-grade REST API for the Quantum Even/Odd trading platform. Manages:
- Real-time trade execution
- Risk management & protection
- Performance analytics
- Account management
- Notification routing

## Base URL

```
http://localhost:3001
Development: http://localhost:3001
Production: https://api.trader.com
```

## Authentication

All endpoints (except `/health`) require JWT Bearer token:

```bash
Authorization: Bearer <jwt_token>
```

## Endpoints

### Health & Status

#### `GET /health`
Service health check.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-06-01T21:40:00Z",
  "environment": "production"
}
```

#### `GET /ready`
Kubernetes readiness probe.

**Response:**
```json
{
  "ready": true,
  "timestamp": "2026-06-01T21:40:00Z"
}
```

---

### Trading

#### `POST /api/trades/execute`
Execute an EVEN or ODD trade.

**Request:**
```json
{
  "direction": "EVEN",
  "stake": 0.35,
  "symbol": "R_10"
}
```

**Response (Success):**
```json
{
  "success": true,
  "contractId": "contract_12345",
  "direction": "EVEN",
  "stake": 0.35,
  "timestamp": "2026-06-01T21:40:00Z"
}
```

**Response (Error):**
```json
{
  "error": "Invalid direction or insufficient balance"
}
```

**Status Codes:**
- `200` - Trade executed successfully
- `400` - Invalid request or trade blocked
- `500` - Server error

#### `GET /api/trades/list`
Retrieve trade history.

**Query Parameters:**
- `limit` (optional): Number of trades (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `status` (optional): OPEN, WON, LOST

**Response:**
```json
{
  "trades": [
    {
      "id": "trade_123",
      "contractId": "contract_12345",
      "direction": "EVEN",
      "stake": 0.35,
      "entryTime": "2026-06-01T21:40:00Z",
      "status": "WON",
      "profit": 0.35
    }
  ],
  "total": 1
}
```

---

### Analytics

#### `GET /api/analytics/performance`
Get performance summary.

**Response:**
```json
{
  "totalTrades": 100,
  "wins": 60,
  "losses": 40,
  "winRate": 60.0,
  "profitFactor": 1.5,
  "averageTrade": 0.50,
  "bestTrade": 5.00,
  "worstTrade": -2.00,
  "dailyDrawdown": 1.25,
  "equityGrowth": 50.00
}
```

#### `GET /api/analytics/equity`
Get equity curve data.

**Response:**
```json
{
  "points": [
    { "timestamp": "2026-06-01T12:00:00Z", "equity": 100 },
    { "timestamp": "2026-06-01T13:00:00Z", "equity": 101.5 }
  ]
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2026-06-01T21:40:00Z"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_DIRECTION` | 400 | Invalid trade direction (not EVEN/ODD) |
| `INSUFFICIENT_BALANCE` | 400 | Account balance insufficient |
| `TRADING_BLOCKED` | 400 | Trading blocked by risk engine |
| `DUPLICATE_TRADE` | 400 | Duplicate trade prevented |
| `DERIV_API_ERROR` | 500 | Deriv API error |
| `DATABASE_ERROR` | 500 | Database connection error |

---

## Rate Limiting

- Global rate limit: 100 requests per 15 minutes per IP
- Trade execution: 1 trade per second minimum

**Rate limit headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1622548800
```

---

## WebSocket Events (Future)

### Subscribe to Live Ticks
```json
{
  "type": "subscribe_ticks",
  "symbol": "R_10"
}
```

### Trade Execution Event
```json
{
  "type": "trade_executed",
  "contractId": "contract_12345",
  "direction": "EVEN",
  "stake": 0.35
}
```

---

## Environment Variables

See `.env.example` for full configuration.

Key variables:
- `DERIV_APP_ID` - Deriv application ID
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing key
- `MIN_CONFIDENCE` - Minimum confidence threshold (default: 70)

---

## Examples

### Execute Trade with cURL

```bash
curl -X POST http://localhost:3001/api/trades/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "direction": "EVEN",
    "stake": 0.35
  }'
```

### Get Trade History

```bash
curl http://localhost:3001/api/trades/list \
  -H "Authorization: Bearer <token>"
```

### Monitor Performance

```bash
curl http://localhost:3001/api/analytics/performance \
  -H "Authorization: Bearer <token>"
```

---

## Disclaimer

⚠️ Financial markets involve substantial risk. No strategy guarantees profits. Users assume full responsibility for trading decisions and capital management.
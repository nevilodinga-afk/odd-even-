import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001'),
  host: process.env.HOST || '0.0.0.0',
  deriv: {
    appId: process.env.DERIV_APP_ID || '1089',
    wsUrl: process.env.DERIV_WS_URL || 'wss://ws.derivws.com/websockets/v3',
    apiUrl: process.env.DERIV_API_URL || 'https://api.deriv.com',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://trader:trader_password@localhost:5432/trader',
    maxConnections: 20,
    connectionTimeout: 5000,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    db: 0,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    expiresIn: process.env.JWT_EXPIRY || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'your-32-char-encryption-key-change',
    iv: process.env.ENCRYPTION_IV || 'your-16-char-iv',
  },
  trading: {
    baseStake: parseFloat(process.env.BASE_STAKE || '0.35'),
    riskPercentage: parseFloat(process.env.RISK_PERCENTAGE || '1'),
    maxConsecutiveLosses: parseInt(process.env.MAX_CONSECUTIVE_LOSSES || '2'),
    cooldownMinutes: parseInt(process.env.COOLDOWN_MINUTES || '10'),
    minConfidence: parseInt(process.env.MIN_CONFIDENCE || '70'),
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },
};
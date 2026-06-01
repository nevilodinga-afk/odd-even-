import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import logger from '../utils/logger';

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timeout: NodeJS.Timeout;
}

class DerivClient {
  private ws: WebSocket | null = null;
  private messageId = 1;
  private pendingRequests: Map<number, PendingRequest> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 5000;
  private authToken: string | null = null;
  private tickHandlers: Array<(tick: any) => void> = [];

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(config.deriv.wsUrl, {
          handshakeTimeout: 10000,
        });

        this.ws.on('open', () => {
          logger.info('Deriv WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        });

        this.ws.on('message', (data: string) => {
          this.handleMessage(JSON.parse(data));
        });

        this.ws.on('error', (error: Error) => {
          logger.error('WebSocket error:', error.message);
          reject(error);
        });

        this.ws.on('close', () => {
          logger.warn('Deriv WebSocket disconnected');
          this.attemptReconnect();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(message: any): void {
    if (message.req_id) {
      const pending = this.pendingRequests.get(message.req_id);
      if (pending) {
        clearTimeout(pending.timeout);
        pending.resolve(message);
        this.pendingRequests.delete(message.req_id);
      }
    }

    if (message.tick) {
      this.tickHandlers.forEach(handler => handler(message));
    }
  }

  async authorize(token: string): Promise<any> {
    this.authToken = token;
    return this.send({
      authorize: token,
    });
  }

  async getTicks(symbol: string, count: number): Promise<any> {
    return this.send({
      ticks_history: symbol,
      count,
      granularity: 0,
      style: 'ticks',
    });
  }

  async buyContract(params: any): Promise<any> {
    return this.send({
      buy: 1,
      ...params,
    });
  }

  async getContractStatus(contractId: string): Promise<any> {
    return this.send({
      proposal_open_contract: 1,
      contract_id: contractId,
    });
  }

  subscribeTicks(symbol: string, handler: (tick: any) => void): void {
    this.tickHandlers.push(handler);
    this.send({
      ticks: symbol,
    }).catch(error => logger.error('Failed to subscribe to ticks:', error));
  }

  private send(request: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const reqId = this.messageId++;
      const message = { ...request, req_id: reqId };

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(reqId);
        reject(new Error('Request timeout'));
      }, 30000);

      this.pendingRequests.set(reqId, { resolve, reject, timeout });

      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        clearTimeout(timeout);
        this.pendingRequests.delete(reqId);
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      logger.info(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      setTimeout(() => this.connect().catch(err => logger.error('Reconnect failed:', err)), delay);
    } else {
      logger.error('Max reconnection attempts reached');
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

let derivClient: DerivClient | null = null;

export const getDerivClient = (): DerivClient => {
  if (!derivClient) {
    derivClient = new DerivClient();
  }
  return derivClient;
};

export const startDerivWebSocket = async (): Promise<void> => {
  const client = getDerivClient();
  await client.connect();
};

export default DerivClient;
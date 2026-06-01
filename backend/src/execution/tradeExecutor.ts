import { config } from '../config';
import { getDerivClient } from '../deriv/derivClient';
import logger from '../utils/logger';

interface ExecutionResult {
  success: boolean;
  contractId?: string;
  error?: string;
}

class TradeExecutor {
  private lastTradeTime: Date | null = null;
  private executedTradeIds: Set<string> = new Set();
  private duplicatePrevention: Map<string, number> = new Map();

  async execute(
    direction: 'EVEN' | 'ODD',
    stake: number,
    symbol: string = 'R_10'
  ): Promise<ExecutionResult> {
    try {
      const tradeKey = `${direction}-${stake}-${Date.now()}`;
      if (this.duplicatePrevention.has(tradeKey)) {
        const count = this.duplicatePrevention.get(tradeKey) || 0;
        if (count > 0) {
          logger.warn('Duplicate trade prevention triggered');
          return { success: false, error: 'Duplicate trade prevented' };
        }
      }

      this.duplicatePrevention.set(tradeKey, 1);

      if (this.lastTradeTime) {
        const timeSinceLastTrade = Date.now() - this.lastTradeTime.getTime();
        if (timeSinceLastTrade < 1000) {
          logger.warn('Trade executed too quickly, potential duplicate');
          return { success: false, error: 'Rate limit: trades too frequent' };
        }
      }

      const client = getDerivClient();

      const contractResponse = await client.buyContract({
        contract_type: direction === 'EVEN' ? 'DIGITEVEN' : 'DIGITODD',
        amount: stake,
        currency: 'USD',
        duration: 1,
        duration_unit: 't',
        symbol: symbol,
      });

      if (!contractResponse.buy) {
        return {
          success: false,
          error: contractResponse.error?.message || 'Buy contract failed',
        };
      }

      const contractId = contractResponse.buy.contract_id;
      this.executedTradeIds.add(contractId);
      this.lastTradeTime = new Date();

      logger.info(`Trade executed: ${direction} | Stake: ${stake} | Contract: ${contractId}`);

      return {
        success: true,
        contractId,
      };
    } catch (error: any) {
      logger.error('Trade execution error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async closeContract(contractId: string): Promise<ExecutionResult> {
    try {
      const client = getDerivClient();

      const closeResponse = await client.send({
        sell: contractId,
        price: 0,
      });

      if (!closeResponse.sell) {
        return {
          success: false,
          error: closeResponse.error?.message || 'Sell contract failed',
        };
      }

      logger.info(`Contract closed: ${contractId}`);
      return { success: true };
    } catch (error: any) {
      logger.error('Contract close error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  clearOldDuplicatePrevention(): void {
    const now = Date.now();
    const maxAge = 60000;

    for (const [key] of this.duplicatePrevention) {
      if (this.duplicatePrevention.size > 1000) {
        this.duplicatePrevention.delete(key);
      }
    }
  }
}

export default TradeExecutor;
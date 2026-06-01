import { config } from '../config';
import logger from '../utils/logger';

interface RiskState {
  dailyDrawdown: number;
  dailyProfit: number;
  consecutiveLosses: number;
  totalDrawdown: number;
  canTrade: boolean;
  reasons: string[];
}

class RiskManager {
  private dailyDrawdown: number = 0;
  private dailyProfit: number = 0;
  private consecutiveLosses: number = 0;
  private totalDrawdown: number = 0;
  private accountBalance: number = 0;
  private trades: Array<{ win: boolean; profit: number }> = [];

  constructor(initialBalance: number) {
    this.accountBalance = initialBalance;
  }

  calculateStake(accountBalance: number): number {
    const riskAmount = accountBalance * (config.trading.riskPercentage / 100);
    return Math.max(config.trading.baseStake, riskAmount);
  }

  recordTrade(win: boolean, profit: number): void {
    this.trades.push({ win, profit });
    this.accountBalance += profit;

    if (win) {
      this.consecutiveLosses = 0;
      this.dailyProfit += profit;
    } else {
      this.consecutiveLosses++;
      this.dailyDrawdown += Math.abs(profit);
      this.totalDrawdown += Math.abs(profit);
    }
  }

  calculateRecoveryStake(baseStake: number, consecutiveLosses: number): number {
    if (consecutiveLosses === 1) {
      return baseStake * 0.8;
    } else if (consecutiveLosses === 2) {
      return baseStake * 0.6;
    }
    return 0;
  }

  getRiskState(): RiskState {
    const reasons: string[] = [];
    let canTrade = true;

    const dailyStopLoss = this.accountBalance * 0.05;
    if (this.dailyDrawdown > dailyStopLoss) {
      canTrade = false;
      reasons.push(`Daily stop loss hit: -${this.dailyDrawdown.toFixed(2)}`);
    }

    const dailyProfitTarget = this.accountBalance * 0.1;
    if (this.dailyProfit > dailyProfitTarget) {
      canTrade = false;
      reasons.push(`Daily profit target achieved: +${this.dailyProfit.toFixed(2)}`);
    }

    if (this.consecutiveLosses >= config.trading.maxConsecutiveLosses) {
      canTrade = false;
      reasons.push(`Max consecutive losses reached: ${this.consecutiveLosses}`);
    }

    const maxDrawdownThreshold = this.accountBalance * 0.15;
    if (this.totalDrawdown > maxDrawdownThreshold) {
      canTrade = false;
      reasons.push(`Maximum drawdown exceeded: ${(this.totalDrawdown / this.accountBalance * 100).toFixed(2)}%`);
    }

    return {
      dailyDrawdown: this.dailyDrawdown,
      dailyProfit: this.dailyProfit,
      consecutiveLosses: this.consecutiveLosses,
      totalDrawdown: this.totalDrawdown,
      canTrade,
      reasons,
    };
  }

  resetDaily(): void {
    this.dailyDrawdown = 0;
    this.dailyProfit = 0;
    logger.info('Daily metrics reset');
  }

  getWinRate(): number {
    if (this.trades.length === 0) return 0;
    const wins = this.trades.filter(t => t.win).length;
    return (wins / this.trades.length) * 100;
  }
}

export default RiskManager;
import TickStream from './tickStream';
import { config } from '../config';
import logger from '../utils/logger';

interface StrategyAnalysis {
  buyEvenSignal: boolean;
  buyOddSignal: boolean;
  confidence: number;
  reasoning: string[];
}

class EvenOddStrategy {
  private tickStream: TickStream;

  constructor(tickStream: TickStream) {
    this.tickStream = tickStream;
  }

  analyze(): StrategyAnalysis {
    const last10 = this.tickStream.getLastDigits(10);
    const last20 = this.tickStream.getLastDigits(20);
    const stats10 = this.tickStream.calculateStats(10);
    const stats20 = this.tickStream.calculateStats(20);

    if (!stats10 || !stats20) {
      return {
        buyEvenSignal: false,
        buyOddSignal: false,
        confidence: 0,
        reasoning: ['Insufficient data'],
      };
    }

    const reasoning: string[] = [];
    let confidence = 50;

    const last5 = last10.slice(-5);
    const last5EvenCount = last5.filter(d => d % 2 === 0).length;
    const last5OddCount = last5.filter(d => d % 2 === 1).length;

    const oddDominance = stats10.oddPercentage > 70;
    const evenDominance = stats10.evenPercentage > 70;

    const lowRandomness = stats10.randomnessScore < 20;
    const highStability = stats10.stabilityScore > 85;

    let buyEvenSignal = false;
    let buyOddSignal = false;

    if (
      last5OddCount >= 4 &&
      stats10.oddCount >= 8 &&
      lowRandomness &&
      highStability
    ) {
      buyEvenSignal = true;
      confidence = Math.min(95, 50 + stats10.oddPercentage / 2);
      reasoning.push('EVEN: Strong odd dominance detected, reversal expected');
    }

    if (
      last5EvenCount >= 4 &&
      stats10.evenCount >= 8 &&
      lowRandomness &&
      highStability
    ) {
      buyOddSignal = true;
      confidence = Math.min(95, 50 + stats10.evenPercentage / 2);
      reasoning.push('ODD: Strong even dominance detected, reversal expected');
    }

    if (confidence < config.trading.minConfidence) {
      buyEvenSignal = false;
      buyOddSignal = false;
      reasoning.push(`Confidence too low: ${confidence.toFixed(2)}%`);
    }

    if (stats10.randomnessScore > 20) {
      reasoning.push('Randomness elevated, signal weak');
    }

    if (!highStability) {
      reasoning.push('Market unstable, caution advised');
    }

    return {
      buyEvenSignal,
      buyOddSignal,
      confidence: Math.round(confidence),
      reasoning,
    };
  }

  getMarketState(): string {
    const stats = this.tickStream.calculateStats(20);
    if (!stats) return 'UNKNOWN';

    if (stats.randomnessScore > 50) return 'CHAOTIC';
    if (stats.randomnessScore > 30) return 'DANGEROUS';
    if (stats.randomnessScore > 15) return 'CAUTION';
    return 'STABLE';
  }
}

export default EvenOddStrategy;
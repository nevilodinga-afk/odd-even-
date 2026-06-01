interface TickData {
  quote: number;
  digit: number;
  timestamp: Date;
}

class TickStream {
  private ticks: TickData[] = [];
  private maxSize = 100;

  addTick(tickResponse: any): void {
    const quote = tickResponse.tick.quote;
    const digit = Math.floor(quote) % 10;

    this.ticks.push({
      quote,
      digit,
      timestamp: new Date(tickResponse.tick.epoch * 1000),
    });

    if (this.ticks.length > this.maxSize) {
      this.ticks = this.ticks.slice(-this.maxSize);
    }
  }

  getLastDigits(count: number): number[] {
    return this.ticks.slice(-count).map(t => t.digit);
  }

  getLastQuotes(count: number): number[] {
    return this.ticks.slice(-count).map(t => t.quote);
  }

  getLastTicks(count: number): TickData[] {
    return this.ticks.slice(-count);
  }

  calculateStats(count: number = 10) {
    const digits = this.getLastDigits(count);
    if (digits.length === 0) return null;

    const evenCount = digits.filter(d => d % 2 === 0).length;
    const oddCount = digits.filter(d => d % 2 === 1).length;
    const streakLength = this.calculateStreak(digits);

    return {
      evenCount,
      oddCount,
      totalCount: digits.length,
      evenPercentage: (evenCount / digits.length) * 100,
      oddPercentage: (oddCount / digits.length) * 100,
      streakLength,
      randomnessScore: this.calculateRandomness(digits),
      stabilityScore: this.calculateStability(digits),
    };
  }

  private calculateStreak(digits: number[]): number {
    if (digits.length === 0) return 0;

    let maxStreak = 1;
    let currentStreak = 1;
    const lastDigitType = digits[0] % 2;

    for (let i = 1; i < digits.length; i++) {
      const currentDigitType = digits[i] % 2;
      if (currentDigitType === lastDigitType) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  }

  private calculateRandomness(digits: number[]): number {
    let alternations = 0;
    for (let i = 1; i < digits.length; i++) {
      if ((digits[i] % 2) !== (digits[i - 1] % 2)) {
        alternations++;
      }
    }
    return (alternations / (digits.length - 1)) * 100;
  }

  private calculateStability(digits: number[]): number {
    return 100 - this.calculateRandomness(digits);
  }

  clear(): void {
    this.ticks = [];
  }

  size(): number {
    return this.ticks.length;
  }
}

export default TickStream;
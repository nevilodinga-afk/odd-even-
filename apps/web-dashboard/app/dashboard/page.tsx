'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface PerformanceMetrics {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number;
  averageTrade: number;
  bestTrade: number;
  worstTrade: number;
  dailyDrawdown: number;
  equityGrowth: number;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  const { data: performanceData, isLoading } = useQuery({
    queryKey: ['performance'],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/performance`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    },
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (performanceData) {
      setMetrics(performanceData);
    }
  }, [performanceData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-darker">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darker text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-accent mb-2">Trading Dashboard</h1>
        <p className="text-gray-400">Real-time performance tracking</p>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Trades */}
        <div className="bg-dark rounded-lg p-6 border border-accent/20">
          <div className="text-gray-400 text-sm mb-2">Total Trades</div>
          <div className="text-3xl font-bold text-white mb-2">{metrics?.totalTrades || 0}</div>
          <div className="text-xs text-gray-500">Lifetime executions</div>
        </div>

        {/* Win Rate */}
        <div className="bg-dark rounded-lg p-6 border border-green-500/20">
          <div className="text-gray-400 text-sm mb-2">Win Rate</div>
          <div className="text-3xl font-bold text-green-400 mb-2">
            {metrics?.winRate.toFixed(2)}%
          </div>
          <div className="text-xs text-gray-500">
            {metrics?.wins}W / {metrics?.losses}L
          </div>
        </div>

        {/* Profit Factor */}
        <div className="bg-dark rounded-lg p-6 border border-blue-500/20">
          <div className="text-gray-400 text-sm mb-2">Profit Factor</div>
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {metrics?.profitFactor.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">Gross profit / Gross loss</div>
        </div>

        {/* Average Trade */}
        <div className="bg-dark rounded-lg p-6 border border-purple-500/20">
          <div className="text-gray-400 text-sm mb-2">Average Trade</div>
          <div className="text-3xl font-bold text-purple-400 mb-2">
            ${metrics?.averageTrade.toFixed(2) || '0.00'}
          </div>
          <div className="text-xs text-gray-500">Per trade average</div>
        </div>

        {/* Best Trade */}
        <div className="bg-dark rounded-lg p-6 border border-green-500/20">
          <div className="text-gray-400 text-sm mb-2">Best Trade</div>
          <div className="text-3xl font-bold text-green-500 mb-2">
            ${metrics?.bestTrade.toFixed(2) || '0.00'}
          </div>
          <div className="text-xs text-gray-500">Maximum profit</div>
        </div>

        {/* Worst Trade */}
        <div className="bg-dark rounded-lg p-6 border border-red-500/20">
          <div className="text-gray-400 text-sm mb-2">Worst Trade</div>
          <div className="text-3xl font-bold text-red-500 mb-2">
            ${metrics?.worstTrade.toFixed(2) || '0.00'}
          </div>
          <div className="text-xs text-gray-500">Maximum loss</div>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drawdown */}
        <div className="bg-dark rounded-lg p-6 border border-orange-500/20">
          <div className="text-gray-400 text-sm mb-4">Daily Drawdown</div>
          <div className="flex items-end justify-between">
            <div className="text-4xl font-bold text-orange-400">
              ${Math.abs(metrics?.dailyDrawdown || 0).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">Loss today</div>
          </div>
        </div>

        {/* Equity Growth */}
        <div className="bg-dark rounded-lg p-6 border border-green-500/20">
          <div className="text-gray-400 text-sm mb-4">Equity Growth</div>
          <div className="flex items-end justify-between">
            <div className="text-4xl font-bold text-green-400">
              +{metrics?.equityGrowth.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-500">Growth rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
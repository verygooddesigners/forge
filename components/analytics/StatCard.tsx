'use client';

import { Card } from '@/components/ui/card';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '@/lib/chart-theme';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number; // percentage change from previous period
  sparklineData?: { value: number }[];
  color?: string;
}

export function StatCard({ title, value, change, sparklineData, color = CHART_COLORS.primary }: StatCardProps) {
  const trendIcon = change !== undefined
    ? change > 0
      ? <TrendingUp className="w-3 h-3" />
      : change < 0
        ? <TrendingDown className="w-3 h-3" />
        : <Minus className="w-3 h-3" />
    : null;

  const trendColor = change !== undefined
    ? change > 0
      ? 'text-success'
      : change < 0
        ? 'text-error'
        : 'text-text-tertiary'
    : '';

  return (
    <Card className="p-5 relative overflow-hidden">
      <div className="relative z-10">
        <div className="text-xs text-text-tertiary uppercase tracking-wide mb-2 font-semibold">
          {title}
        </div>
        <div className="text-[28px] font-bold font-mono tracking-tight text-text-primary">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-[11px] mt-1 ${trendColor}`}>
            {trendIcon}
            <span>{change > 0 ? '+' : ''}{change.toFixed(1)}% vs prev period</span>
          </div>
        )}
      </div>
      {sparklineData && sparklineData.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-12 opacity-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                fill={color}
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

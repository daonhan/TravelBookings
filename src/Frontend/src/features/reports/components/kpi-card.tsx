import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui';
import { cn } from '@/shared/utils';

interface KpiCardProps {
  /** KPI metric title. */
  title: string;
  /** Formatted value to display prominently. */
  value: string | number;
  /** Decorative icon rendered on the right side. */
  icon: ReactNode;
  /** Optional description below the value. */
  description?: string;
  /** Optional trend indicator with percentage value. */
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function KpiCard({ title, value, icon, description, trend }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              {value}
            </p>

            {(trend || description) && (
              <div className="mt-2 flex items-center gap-2">
                {trend && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 text-sm font-medium',
                      trend.isPositive ? 'text-green-600' : 'text-red-600',
                    )}
                  >
                    {trend.isPositive ? (
                      <TrendingUp className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <TrendingDown className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span>
                      {trend.isPositive ? '+' : ''}
                      {trend.value}%
                    </span>
                  </span>
                )}
                {description && (
                  <span className="text-sm text-gray-500">{description}</span>
                )}
              </div>
            )}
          </div>

          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"
            aria-hidden="true"
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

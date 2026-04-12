import { AreaChart } from '@tremor/react';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/shared/ui';
import { useTranslation } from 'react-i18next';

interface RevenueChartProps {
  /** Revenue data points with date and revenue values. */
  data: Array<{ date: string; revenue: number }>;
  /** Whether the chart data is still loading. */
  isLoading: boolean;
}

function ChartSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Loading chart">
      <Skeleton variant="text" width="30%" />
      <Skeleton variant="rectangle" height={300} />
    </div>
  );
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  const { t } = useTranslation('reports');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('revenueChart.title', 'Revenue Over Time')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('revenueChart.title', 'Revenue Over Time')}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">
            {t('revenueChart.noData', 'No revenue data for the selected period.')}
          </p>
        ) : (
          <AreaChart
            className="h-72"
            data={data}
            index="date"
            categories={['revenue']}
            colors={['blue']}
            valueFormatter={(value: number) =>
              new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(value)
            }
            showAnimation
            curveType="monotone"
            yAxisWidth={80}
          />
        )}
      </CardContent>
    </Card>
  );
}

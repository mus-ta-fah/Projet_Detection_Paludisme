'use client';

import { useQuery } from '@tanstack/react-query';
import { statisticsApi, predictionsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, Clock, Target } from 'lucide-react';
import { formatPercentage } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Prediction } from '@/types';

export default function DashboardPage() {
  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['statistics', 'overview'],
    queryFn: () => statisticsApi.getOverview(),
  });

  // Fetch trends
  const { data: trends } = useQuery({
    queryKey: ['statistics', 'trends'],
    queryFn: () => statisticsApi.getTrends(7),
  });

  // Fetch recent predictions
  const { data: history } = useQuery({
    queryKey: ['predictions', 'history'],
    queryFn: () => predictionsApi.getHistory(0, 5),
  });

  if (statsLoading) {
    return <div>Loading...</div>;
  }

  const statistics = stats?.statistics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your malaria detection activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Predictions"
          value={statistics?.total_predictions || 0}
          icon={<Activity className="h-4 w-4" />}
          trend="+12% from last month"
        />
        <StatsCard
          title="Today's Predictions"
          value={statistics?.today_predictions || 0}
          icon={<TrendingUp className="h-4 w-4" />}
          trend="Updated just now"
        />
        <StatsCard
          title="Average Confidence"
          value={formatPercentage(statistics?.average_confidence || 0)}
          icon={<Target className="h-4 w-4" />}
          trend="High accuracy"
        />
        <StatsCard
          title="Avg Response Time"
          value={`${Math.round(statistics?.average_inference_time_ms || 0)}ms`}
          icon={<Clock className="h-4 w-4" />}
          trend="Fast processing"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Predictions Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Predictions Trend (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {trends?.trends && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Detection Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Parasitized</span>
                <span className="text-sm text-muted-foreground">
                  {statistics?.parasitized_count || 0} (
                  {formatPercentage(statistics?.parasitized_percentage || 0)})
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500"
                  style={{ width: `${statistics?.parasitized_percentage || 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Uninfected</span>
                <span className="text-sm text-muted-foreground">
                  {statistics?.uninfected_count || 0} (
                  {formatPercentage(100 - (statistics?.parasitized_percentage || 0))})
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${100 - (statistics?.parasitized_percentage || 0)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {history?.predictions?.map((prediction: Prediction) => (
              <div
                key={prediction.id}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div className="space-y-1">
                  <p className="font-medium">{prediction.image_filename}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(prediction.created_at), 'PPp')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={prediction.is_parasitized ? 'destructive' : 'default'}
                  >
                    {prediction.prediction}
                  </Badge>
                  <span className="text-sm font-medium">
                    {formatPercentage(prediction.confidence || 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{trend}</p>
      </CardContent>
    </Card>
  );
}
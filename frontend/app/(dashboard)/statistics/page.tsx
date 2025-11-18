'use client';

import { useQuery } from '@tanstack/react-query';
import { statisticsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b'];

export default function StatisticsPage() {
  const { data: trends } = useQuery({
    queryKey: ['statistics', 'trends', 30],
    queryFn: () => statisticsApi.getTrends(30),
  });

  const { data: modelsUsage } = useQuery({
    queryKey: ['statistics', 'models-usage'],
    queryFn: () => statisticsApi.getModelsUsage(),
  });

  const { data: overview } = useQuery({
    queryKey: ['statistics', 'overview'],
    queryFn: () => statisticsApi.getOverview(),
  });

  const stats = overview?.statistics;

  // Prepare pie chart data
  const pieData = [
    { name: 'Parasitized', value: stats?.parasitized_count || 0 },
    { name: 'Uninfected', value: stats?.uninfected_count || 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Statistics</h1>
        <p className="text-muted-foreground">
          Detailed analytics and trends
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Trends Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Prediction Trends (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends?.trends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total" />
                <Line type="monotone" dataKey="parasitized" stroke="#ef4444" name="Parasitized" />
                <Line type="monotone" dataKey="uninfected" stroke="#22c55e" name="Uninfected" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Detection Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: { name: string; value: string; }) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Models Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Models Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modelsUsage?.models || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model_name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="usage_count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

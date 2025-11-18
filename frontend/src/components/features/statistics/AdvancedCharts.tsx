'use client';


import { useQuery } from '@tanstack/react-query';
import { statisticsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = {
  primary: '#3b82f6',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  purple: '#a855f7',
};

export function AdvancedCharts() {
  const [timeRange, setTimeRange] = useState('30');

  const { data: trends } = useQuery({
    queryKey: ['statistics', 'trends', timeRange],
    queryFn: () => statisticsApi.getTrends(parseInt(timeRange)),
  });

  const { data: modelsUsage } = useQuery({
    queryKey: ['statistics', 'models-usage'],
    queryFn: () => statisticsApi.getModelsUsage(),
  });

  const { data: overview } = useQuery({
    queryKey: ['statistics', 'overview'],
    queryFn: () => statisticsApi.getOverview(),
  });

  // Prepare data for different charts
  const pieData = overview?.statistics
    ? [
        { name: 'Parasitized', value: overview.statistics.parasitized_count, color: COLORS.danger },
        { name: 'Uninfected', value: overview.statistics.uninfected_count, color: COLORS.success },
      ]
    : [];

  // Radar data for model comparison
  type ModelUsage = {
    model_name: string;
    average_confidence: number;
    average_inference_time_ms: number;
    usage_count: number;
  };

  const radarData = modelsUsage?.models?.map((model: ModelUsage) => ({
    model: model.model_name.split(' ')[0], // Short name
    accuracy: model.average_confidence,
    speed: 100 - (model.average_inference_time_ms / 10), // Inverse for visualization
    usage:
      (model.usage_count /
        Math.max(
          ...modelsUsage.models.map((m: ModelUsage) => m.usage_count)
        )) *
      100,
  })) || [];



  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Advanced Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Area Chart - Predictions Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Prediction Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={trends?.trends || []}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorParasitized" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorUninfected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="total"
                stroke={COLORS.primary}
                fillOpacity={1}
                fill="url(#colorTotal)"
                strokeWidth={2}
                animationDuration={1500}
              />
              <Area
                type="monotone"
                dataKey="parasitized"
                stroke={COLORS.danger}
                fillOpacity={1}
                fill="url(#colorParasitized)"
                strokeWidth={2}
                animationDuration={1500}
              />
              <Area
                type="monotone"
                dataKey="uninfected"
                stroke={COLORS.success}
                fillOpacity={1}
                fill="url(#colorUninfected)"
                strokeWidth={2}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Enhanced Pie Chart */}
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
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart - Models Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Models Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modelsUsage?.models || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="model_name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="usage_count"
                  fill={COLORS.primary}
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                />
                <Bar
                  dataKey="average_confidence"
                  fill={COLORS.success}
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Radar Chart - Model Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Dimensional Model Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="model" stroke="#6b7280" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" />
              <Radar
                name="Accuracy"
                dataKey="accuracy"
                stroke={COLORS.primary}
                fill={COLORS.primary}
                fillOpacity={0.6}
                animationDuration={1000}
              />
              <Radar
                name="Speed"
                dataKey="speed"
                stroke={COLORS.success}
                fill={COLORS.success}
                fillOpacity={0.6}
                animationDuration={1000}
              />
              <Radar
                name="Usage"
                dataKey="usage"
                stroke={COLORS.purple}
                fill={COLORS.purple}
                fillOpacity={0.6}
                animationDuration={1000}
              />
              <Legend />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

  // Custom tooltip
  import type { TooltipProps } from 'recharts';

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color ?? "#000" }}
            >
              {entry.name}: {typeof entry.value === "number" ? entry.value.toFixed(0) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
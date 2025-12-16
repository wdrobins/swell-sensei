import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, Waves, Wind } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface DailyForecast {
  date: string;
  waveHeight: number;
  swellHeight: number;
  swellPeriod: number;
  swellDirection: number;
  windSpeed: number;
  windDirection: number;
  maxWaveHeight: number;
  minWaveHeight: number;
}

interface ForecastChartProps {
  dailyForecast: DailyForecast[];
}

const ForecastChart: React.FC<ForecastChartProps> = ({ dailyForecast }) => {
  // Transform data for the chart - convert meters to feet
  const chartData = dailyForecast.map((day) => ({
    date: format(parseISO(day.date), 'EEE'),
    fullDate: format(parseISO(day.date), 'MMM d'),
    waveHeight: Number((day.swellHeight * 3.28084).toFixed(1)),
    maxWave: Number((day.maxWaveHeight * 3.28084).toFixed(1)),
    minWave: Number((day.minWaveHeight * 3.28084).toFixed(1)),
    windSpeed: Math.round(day.windSpeed),
    swellPeriod: Math.round(day.swellPeriod),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-2">{data.fullDate}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <Waves className="h-3 w-3 text-accent" />
              <span className="text-muted-foreground">Waves:</span>
              <span className="font-medium">{data.minWave}-{data.maxWave}ft</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-3 w-3 text-primary" />
              <span className="text-muted-foreground">Wind:</span>
              <span className="font-medium">{data.windSpeed} kts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Period:</span>
              <span className="font-medium">{data.swellPeriod}s</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-float">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          7-Day Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                className="text-muted-foreground"
                axisLine={{ className: 'stroke-muted' }}
                tickLine={{ className: 'stroke-muted' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                className="text-muted-foreground"
                axisLine={{ className: 'stroke-muted' }}
                tickLine={{ className: 'stroke-muted' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value) => (
                  <span className="text-muted-foreground">
                    {value === 'waveHeight' ? 'Wave Height (ft)' : 'Wind Speed (kts)'}
                  </span>
                )}
              />
              <Area
                type="monotone"
                dataKey="waveHeight"
                name="waveHeight"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                fill="url(#waveGradient)"
              />
              <Area
                type="monotone"
                dataKey="windSpeed"
                name="windSpeed"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#windGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Daily Summary Cards */}
        <div className="grid grid-cols-7 gap-1 mt-4">
          {chartData.map((day, index) => (
            <div
              key={index}
              className={`text-center p-2 rounded-lg ${
                index === 0 ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'
              }`}
            >
              <p className="text-xs font-medium text-foreground">{day.date}</p>
              <p className="text-sm font-bold text-accent">{day.waveHeight}ft</p>
              <p className="text-xs text-muted-foreground">{day.windSpeed}kts</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastChart;

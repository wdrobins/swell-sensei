import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ArrowUp } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';

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
  selectedDayIndex: number;
  onSelectDay: (index: number) => void;
}

// Get condition quality based on wave height and wind
const getConditionColor = (waveHeight: number, windSpeed: number): string => {
  if (waveHeight >= 1 && waveHeight <= 2 && windSpeed < 15) return 'bg-green-500';
  if (waveHeight >= 0.5 && waveHeight <= 3 && windSpeed < 20) return 'bg-yellow-500';
  return 'bg-orange-500';
};

// Format day label
const formatDayLabel = (dateStr: string): string => {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'EEE, d/M');
};

// Convert meters to feet and format as range
const formatWaveRange = (min: number, max: number): string => {
  const minFt = Math.round(min * 3.28084);
  const maxFt = Math.round(max * 3.28084);
  if (minFt === maxFt) return `${minFt}ft`;
  return `${minFt}-${maxFt}ft`;
};

const ForecastChart: React.FC<ForecastChartProps> = ({ dailyForecast, selectedDayIndex, onSelectDay }) => {
  // Take first 7 days
  const forecastData = dailyForecast.slice(0, 7).map((day) => ({
    date: day.date,
    dayLabel: formatDayLabel(day.date),
    waveRange: formatWaveRange(day.minWaveHeight, day.maxWaveHeight),
    windDirection: day.windDirection,
    windSpeed: day.windSpeed,
    conditionColor: getConditionColor(day.swellHeight, day.windSpeed),
    swellDirection: day.swellDirection,
  }));

  return (
    <Card className="shadow-float overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          7-Day Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          {/* Wave illustration background */}
          <div className="absolute left-0 top-0 bottom-8 w-24 bg-gradient-to-r from-accent/20 to-transparent pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-30" preserveAspectRatio="none">
              <path
                d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z"
                fill="hsl(var(--accent))"
              />
              <path
                d="M0,60 Q25,40 50,60 T100,60 L100,100 L0,100 Z"
                fill="hsl(var(--accent))"
                opacity="0.5"
              />
            </svg>
          </div>
          
          {/* Forecast grid */}
          <div className="grid grid-cols-7 relative z-10">
            {forecastData.map((day, index) => (
              <button
                key={day.date}
                onClick={() => onSelectDay(index)}
                className={`flex flex-col items-center py-4 px-2 transition-all cursor-pointer hover:bg-primary/10 ${
                  index === selectedDayIndex ? 'bg-primary/15 ring-2 ring-primary ring-inset' : ''
                } ${index < forecastData.length - 1 ? 'border-r border-border/30' : ''}`}
              >
                {/* Day label */}
                <p className={`text-xs font-medium mb-2 text-center ${
                  index === selectedDayIndex ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {day.dayLabel}
                </p>
                
                {/* Wave height */}
                <p className={`text-lg font-bold mb-3 ${
                  index === selectedDayIndex ? 'text-primary' : 'text-accent'
                }`}>
                  {day.waveRange}
                </p>
                
                {/* Wind direction arrows */}
                <div className="flex gap-0.5 mb-3">
                  {[0, 1, 2].map((i) => (
                    <ArrowUp
                      key={i}
                      className={`h-4 w-4 ${index === selectedDayIndex ? 'text-primary' : 'text-foreground'}`}
                      style={{
                        transform: `rotate(${day.windDirection + (i - 1) * 15}deg)`,
                      }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
          
          {/* Condition color bar */}
          <div className="flex h-2">
            {forecastData.map((day, index) => (
              <div
                key={day.date}
                className={`flex-1 ${day.conditionColor} ${index === selectedDayIndex ? 'ring-2 ring-primary' : ''}`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastChart;

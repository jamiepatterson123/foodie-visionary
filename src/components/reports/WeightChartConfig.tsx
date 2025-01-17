import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
} from 'recharts';
import { WeightTooltipContent } from './WeightTooltipContent';
import { format, parseISO } from 'date-fns';

interface WeightChartConfigProps {
  data: Array<{
    weight: number;
    date: string;
  }>;
  preferredUnits: string;
  isMobile: boolean;
  onDelete: (date: string) => Promise<void>;
}

export const WeightChartConfig: React.FC<WeightChartConfigProps> = ({
  data,
  preferredUnits,
  isMobile,
  onDelete,
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis
          dataKey="date"
          tickFormatter={(dateStr) => {
            try {
              const date = parseISO(dateStr);
              return format(date, 'MMM d');
            } catch (error) {
              console.error('Error formatting date:', dateStr, error);
              return dateStr;
            }
          }}
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          unit={preferredUnits === 'metric' ? 'kg' : ' lbs'}
          domain={['dataMin - 10', 'dataMax + 10']}
        />
        <Tooltip
          content={(props: TooltipProps<number, string>) => (
            <WeightTooltipContent
              {...props}
              onDelete={onDelete}
              preferredUnits={preferredUnits}
              isMobile={isMobile}
            />
          )}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#2563eb"
          strokeWidth={1.5}
          dot={{ r: 3, strokeWidth: 1, fill: "#fff" }}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
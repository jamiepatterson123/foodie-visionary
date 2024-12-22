import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface NutritionChartProps {
  data: {
    name: string;
    value: number;
    target: number;
    color: string;
  }[];
}

export const NutritionBarChart: React.FC<NutritionChartProps> = ({ data }) => {
  const getBarColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage > 110) return "#ea384c"; // Red for over 10%
    if (percentage < 100) return "#FEC6A1"; // Orange for under target
    return "#22c55e"; // Green for within 10%
  };

  const isWithinTarget = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    return Math.abs(100 - percentage) <= 10;
  };

  return (
    <div className="w-full h-[300px] mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
          <XAxis type="number" className="text-xs font-medium" />
          <YAxis
            type="category"
            dataKey="name"
            className="text-xs font-medium"
            width={75}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const withinTarget = isWithinTarget(data.value, data.target);
                const percentage = (data.value / data.target) * 100;
                const status = percentage > 110 
                  ? "Over target" 
                  : percentage < 100 
                    ? "Under target" 
                    : "Within target";
                return (
                  <div className="bg-background border border-border/50 rounded-lg p-2 text-sm">
                    <p className="font-medium">{data.name}</p>
                    <p>Current: {data.value}</p>
                    <p>Target: {data.target}</p>
                    <p className={withinTarget ? "text-green-600" : percentage > 110 ? "text-red-600" : "text-orange-600"}>
                      Progress: {Math.round(percentage)}%
                      {withinTarget && " ✓"}
                    </p>
                    <p className="text-sm text-muted-foreground">{status}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="target"
            fill="#F2FCE2"
            radius={[0, 4, 4, 0]}
            barSize={30}
          />
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
            barSize={30}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getBarColor(entry.value, entry.target)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
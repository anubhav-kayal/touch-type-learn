"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface StatsTrendChartProps {
  series: { at: string; wpm: number; accuracy: number }[];
}

function tickLabel(at: string): string {
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) {
    return at.slice(5, 10);
  }
  return `${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function StatsTrendChart({ series }: StatsTrendChartProps) {
  const data = series.map((point) => ({
    ...point,
    label: tickLabel(point.at),
    accuracyPct: Math.round(point.accuracy * 100),
  }));

  return (
    <div className="h-56 w-full" data-testid="stats-trend">
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={320}
        minHeight={224}
        initialDimension={{ width: 640, height: 224 }}
      >
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(21, 32, 43, 0.12)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#4a5a6d", fontSize: 11, fontFamily: "IBM Plex Mono, ui-monospace, monospace" }}
            axisLine={{ stroke: "rgba(21, 32, 43, 0.2)" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="wpm"
            tick={{ fill: "#4a5a6d", fontSize: 11, fontFamily: "IBM Plex Mono, ui-monospace, monospace" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <YAxis
            yAxisId="accuracy"
            orientation="right"
            domain={[0, 100]}
            tick={{ fill: "#4a5a6d", fontSize: 11, fontFamily: "IBM Plex Mono, ui-monospace, monospace" }}
            axisLine={false}
            tickLine={false}
            width={36}
            unit="%"
          />
          <Tooltip
            contentStyle={{
              background: "#f3f6fa",
              border: "1px solid rgba(21, 32, 43, 0.12)",
              borderRadius: 12,
              fontFamily: "IBM Plex Mono, ui-monospace, monospace",
              fontSize: 12,
              color: "#15202b",
            }}
            formatter={(value, name) => {
              if (name === "accuracyPct") {
                return [`${value}%`, "Accuracy"];
              }
              return [value, "WPM"];
            }}
          />
          <Line
            yAxisId="wpm"
            type="monotone"
            dataKey="wpm"
            stroke="#15202b"
            strokeWidth={2}
            dot={{ r: 3, fill: "#15202b" }}
            isAnimationActive={false}
          />
          <Line
            yAxisId="accuracy"
            type="monotone"
            dataKey="accuracyPct"
            stroke="#c9a227"
            strokeWidth={2}
            dot={{ r: 3, fill: "#c9a227" }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

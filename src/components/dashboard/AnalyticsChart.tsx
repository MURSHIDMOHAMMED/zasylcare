"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function AnalyticsChart({
  data,
  type = "area"
}: {
  data: Array<Record<string, string | number>>;
  type?: "area" | "bar";
}) {
  return (
    <div className="h-80 rounded-lg border bg-card p-4">
      <ResponsiveContainer width="100%" height="100%">
        {type === "area" ? (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="leads" stroke="#0f766e" fill="#99f6e4" />
            <Area type="monotone" dataKey="bookings" stroke="#2563eb" fill="#bfdbfe" />
          </AreaChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#0f766e" radius={[6, 6, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

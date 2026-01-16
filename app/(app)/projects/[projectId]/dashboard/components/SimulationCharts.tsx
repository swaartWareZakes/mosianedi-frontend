"use client";

import React from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Activity, DollarSign } from "lucide-react";
import type { SimulationOutput } from "../../config/types";

type Props = {
  results: SimulationOutput | null;
};

export function SimulationCharts({ results }: Props) {
  if (!results) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-2 mt-6">
      
      {/* Chart 1: Condition Over Time */}
      <div className="p-4 rounded-2xl bg-[var(--surface-bg)] border border-slate-200/10 dark:border-slate-800/60 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            Predicted Network Condition
          </h2>
          <span className="text-[10px] text-slate-500">Average IRI (Lower is better)</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={results.yearly_data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: "10px" }} />
              <Line 
                type="monotone" 
                dataKey="avg_condition_index" 
                name="Average IRI" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Cost Profile */}
      <div className="p-4 rounded-2xl bg-[var(--surface-bg)] border border-slate-200/10 dark:border-slate-800/60 space-y-2">
        <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-2">
            {/* Replaced DollarSign with a styled 'R' */}
            <span className="h-4 w-4 flex items-center justify-center text-emerald-500 font-bold">
              R
            </span>
            Annual Expenditure
          </h2>
          <span className="text-[10px] text-slate-500">Maintenance Budget Needed</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={results.yearly_data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `R${val/1000000}M`} 
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                formatter={(value: number) => [`R${(value).toLocaleString()}`, 'Cost']}
              />
              <Bar dataKey="total_maintenance_cost" name="Maintenance Cost" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
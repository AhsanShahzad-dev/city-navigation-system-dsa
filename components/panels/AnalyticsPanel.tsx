'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGraphStore } from '@/store/useGraphStore';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { Network, Route, Ruler, Zap } from 'lucide-react';

export function AnalyticsPanel() {
  const { nodes, edges } = useGraphStore();

  const totalDist = edges.reduce((s, e) => s + (e.data?.distance ?? 0), 0);
  const avgDist = edges.length > 0 ? (totalDist / edges.length).toFixed(1) : '0';
  const closedRoads = edges.filter(e => e.data?.isClosed).length;

  const trafficData = [
    { name: 'Low',    value: edges.filter(e => e.data?.traffic === 'low'    && !e.data?.isClosed).length, color: '#22c55e' },
    { name: 'Medium', value: edges.filter(e => e.data?.traffic === 'medium' && !e.data?.isClosed).length, color: '#f59e0b' },
    { name: 'High',   value: edges.filter(e => e.data?.traffic === 'high'   && !e.data?.isClosed).length, color: '#ef4444' },
    { name: 'Closed', value: closedRoads, color: '#64748b' },
  ].filter(d => d.value > 0);

  const degreeData = nodes
    .map(n => ({
      name: n.id,
      connections: edges.filter(e => e.source === n.id || e.target === n.id).length,
    }))
    .sort((a, b) => b.connections - a.connections)
    .slice(0, 6);

  const stats = [
    { icon: Network, label: 'Intersections', value: nodes.length, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
    { icon: Route,   label: 'Roads',         value: edges.length, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { icon: Ruler,   label: 'Avg Length',    value: `${avgDist}m`, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
    { icon: Zap,     label: 'Closed Roads',  value: closedRoads, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
  ];

  return (
    <div className="space-y-3 pb-10">
      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-2">
        {stats.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`p-3 rounded-xl border ${bg} flex flex-col`}>
            <Icon className={`w-4 h-4 mb-2 ${color}`} />
            <span className="text-xl font-black text-foreground">{value}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>

      {/* Traffic pie */}
      {trafficData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Traffic Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={trafficData} cx="50%" cy="50%" innerRadius={36} outerRadius={62} paddingAngle={4} dataKey="value">
                  {trafficData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 -mt-2">
              {trafficData.map(d => (
                <div key={d.name} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Degree bar chart */}
      {degreeData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Most Connected</CardTitle>
          </CardHeader>
          <CardContent className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={degreeData} margin={{ top: 0, right: 4, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                />
                <Bar dataKey="connections" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

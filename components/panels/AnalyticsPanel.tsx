import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGraphStore } from "@/store/useGraphStore";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

export function AnalyticsPanel() {
  const { nodes, edges } = useGraphStore();

  const totalDist = edges.reduce((acc, edge) => acc + (edge.data?.distance || 0), 0);
  const avgDist = edges.length > 0 ? (totalDist / edges.length).toFixed(1) : 0;

  const trafficData = [
    { name: 'Low', value: edges.filter(e => e.data?.traffic === 'low').length, color: '#22C55E' },
    { name: 'Medium', value: edges.filter(e => e.data?.traffic === 'medium').length, color: '#F59E0B' },
    { name: 'High', value: edges.filter(e => e.data?.traffic === 'high').length, color: '#EF4444' },
    { name: 'Closed', value: edges.filter(e => e.data?.isClosed).length, color: '#000000' },
  ].filter(d => d.value > 0);

  // Calculate degrees for nodes
  const nodeDegrees = nodes.map(n => {
    const degree = edges.filter(e => e.source === n.id || e.target === n.id).length;
    return { name: n.id, degree };
  }).sort((a, b) => b.degree - a.degree).slice(0, 5); // top 5

  return (
    <div className="space-y-4 pb-10">
      <Card>
        <CardHeader>
          <CardTitle>City Analytics</CardTitle>
          <CardDescription>Network statistics and metrics.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-md text-center">
              <div className="text-2xl font-bold">{nodes.length}</div>
              <div className="text-xs text-muted-foreground uppercase">Nodes</div>
            </div>
            <div className="p-3 bg-muted rounded-md text-center">
              <div className="text-2xl font-bold">{edges.length}</div>
              <div className="text-xs text-muted-foreground uppercase">Edges</div>
            </div>
            <div className="p-3 bg-muted rounded-md text-center col-span-2">
              <div className="text-2xl font-bold">{avgDist}m</div>
              <div className="text-xs text-muted-foreground uppercase">Average Road Length</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {edges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Traffic Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {trafficData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {nodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Most Connected Intersections</CardTitle>
          </CardHeader>
          <CardContent className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nodeDegrees} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.1)' }} />
                <Bar dataKey="degree" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

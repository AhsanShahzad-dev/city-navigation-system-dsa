import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGraphStore } from "@/store/useGraphStore";
import { Network, Activity, Navigation2, FileText } from "lucide-react";

export function DashboardPanel() {
  const { nodes, edges } = useGraphStore();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>System Dashboard</CardTitle>
        <CardDescription>Overview of the Smart City network.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex flex-col items-center justify-center text-center">
            <Network className="w-6 h-6 mb-2 text-primary" />
            <span className="text-2xl font-bold text-foreground">{nodes.length}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Intersections</span>
          </div>
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center text-center">
            <Activity className="w-6 h-6 mb-2 text-blue-500" />
            <span className="text-2xl font-bold text-foreground">{edges.length}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Roads</span>
          </div>
        </div>

        <div className="space-y-3 mt-6">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick Actions</h4>
          
          <button 
            className="w-full flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors text-sm font-medium"
            onClick={() => useGraphStore.getState().setMode('navigation')}
          >
            <div className="flex items-center gap-3">
              <Navigation2 className="w-4 h-4 text-blue-500" />
              Find Route
            </div>
            <span>&rarr;</span>
          </button>
          
          <button 
            className="w-full flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors text-sm font-medium"
            onClick={() => useGraphStore.getState().setMode('build')}
          >
            <div className="flex items-center gap-3">
              <Network className="w-4 h-4 text-emerald-500" />
              Build Graph
            </div>
            <span>&rarr;</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

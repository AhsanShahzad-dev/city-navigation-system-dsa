import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useGraphStore } from "@/store/useGraphStore";
import { TrafficLevel } from "@/store/useGraphStore";
import { ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";

export function TrafficControlPanel() {
  const { edges, updateEdge } = useGraphStore();

  const handleTrafficChange = (edgeId: string, level: TrafficLevel) => {
    updateEdge(edgeId, { traffic: level });
  };

  const handleToggleClose = (edgeId: string, currentClosed: boolean) => {
    updateEdge(edgeId, { isClosed: !currentClosed });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Traffic Control</CardTitle>
          <CardDescription>Simulate traffic congestion and road closures.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto hidden-scrollbar pr-2">
          {edges.map(edge => {
            const t = edge.data?.traffic || 'low';
            const closed = edge.data?.isClosed || false;

            return (
              <div key={edge.id} className="p-4 rounded-xl border bg-muted/30 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-sm">
                    {edge.source} &rarr; {edge.target}
                  </span>
                  
                  <button
                    onClick={() => handleToggleClose(edge.id, closed)}
                    className={`text-xs px-2 py-1 rounded-md font-semibold transition-colors ${
                      closed 
                        ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {closed ? 'Closed' : 'Open'}
                  </button>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Traffic Level</Label>
                  <div className="flex gap-2">
                    <button
                      disabled={closed}
                      onClick={() => handleTrafficChange(edge.id, 'low')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                        t === 'low' ? 'bg-green-500 text-white shadow-md' : 'bg-background border hover:bg-muted'
                      } ${closed ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Low
                    </button>
                    <button
                      disabled={closed}
                      onClick={() => handleTrafficChange(edge.id, 'medium')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                        t === 'medium' ? 'bg-yellow-500 text-white shadow-md' : 'bg-background border hover:bg-muted'
                      } ${closed ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <AlertTriangle className="w-3 h-3" /> Med
                    </button>
                    <button
                      disabled={closed}
                      onClick={() => handleTrafficChange(edge.id, 'high')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                        t === 'high' ? 'bg-red-500 text-white shadow-md' : 'bg-background border hover:bg-muted'
                      } ${closed ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ShieldAlert className="w-3 h-3" /> High
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {edges.length === 0 && (
            <div className="text-center text-sm text-muted-foreground p-4">
              No roads available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

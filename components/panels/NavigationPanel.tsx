import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useGraphStore } from "@/store/useGraphStore";
import { getShortestPath } from "@/lib/algorithms";

export function NavigationPanel() {
  const { nodes, edges, updateEdge, clearHighlights } = useGraphStore();
  const [source, setSource] = useState("");
  const [dest, setDest] = useState("");
  const [result, setResult] = useState<{ path: string[], distance: number, visited: number } | null>(null);
  const [execTime, setExecTime] = useState<number>(0);

  const handleFindRoute = () => {
    if (!source || !dest) return;
    
    clearHighlights();
    
    const startTime = performance.now();
    const res = getShortestPath(nodes, edges, source, dest);
    const endTime = performance.now();
    
    setExecTime(endTime - startTime);
    setResult(res);

    if (res.path.length > 0) {
      // Highlight the edges in the graph store
      for (let i = 0; i < res.path.length - 1; i++) {
        const a = res.path[i];
        const b = res.path[i+1];
        const edge = edges.find(e => (e.source === a && e.target === b) || (e.source === b && e.target === a));
        if (edge) {
          updateEdge(edge.id, { isShortestPath: true });
        }
      }
    }
  };

  const handleReset = () => {
    setSource("");
    setDest("");
    setResult(null);
    clearHighlights();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Navigation</CardTitle>
          <CardDescription>Find the optimal route avoiding traffic.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Source</Label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={source} onChange={e => setSource(e.target.value)}
            >
              <option value="">Select source</option>
              {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Destination</Label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={dest} onChange={e => setDest(e.target.value)}
            >
              <option value="">Select dest</option>
              {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
            </select>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleFindRoute} className="flex-1">Find Route</Button>
            <Button onClick={handleReset} variant="outline">Reset</Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-primary/50 shadow-primary/10">
          <CardHeader>
            <CardTitle className="text-lg">Route Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.path.length > 0 ? (
              <>
                <div>
                  <Label className="text-muted-foreground text-xs">Path</Label>
                  <div className="font-mono text-sm mt-1 bg-muted p-2 rounded-md break-words">
                    {result.path.join(" ➔ ")}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                    <Label className="text-muted-foreground text-xs block mb-1">Total Distance</Label>
                    <span className="font-bold text-lg">{result.distance}m</span>
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                    <Label className="text-muted-foreground text-xs block mb-1">Execution Time</Label>
                    <span className="font-bold text-lg">{execTime.toFixed(2)}ms</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground text-center mt-2">
                  Nodes Visited: {result.visited}
                </div>
              </>
            ) : (
              <div className="text-center text-destructive font-medium p-4 bg-destructive/10 rounded-md">
                No route found!
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

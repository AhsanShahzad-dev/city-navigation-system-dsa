'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useGraphStore } from '@/store/useGraphStore';
import { getShortestPath } from '@/lib/algorithms';
import { Navigation2, RefreshCcw, Clock, Ruler, Route, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function NavigationPanel() {
  const { nodes, edges, updateEdge, clearHighlights } = useGraphStore();
  const [source, setSource] = useState('');
  const [dest, setDest] = useState('');
  const [result, setResult] = useState<{ path: string[]; distance: number; visited: number } | null>(null);
  const [execTime, setExecTime] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleFind = () => {
    if (!source || !dest || source === dest) return;

    setLoading(true);
    clearHighlights();

    setTimeout(() => {
      const t0 = performance.now();
      const res = getShortestPath(nodes, edges, source, dest);
      const t1 = performance.now();

      setExecTime(t1 - t0);
      setResult(res);
      setLoading(false);

      // Highlight path edges on the map sequentially
      if (res.path.length > 0) {
        let i = 0;
        const animatePath = setInterval(() => {
          if (i >= res.path.length - 1) {
            clearInterval(animatePath);
            return;
          }
          const a = res.path[i];
          const b = res.path[i + 1];
          const edge = edges.find(
            e => (e.source === a && e.target === b) || (e.source === b && e.target === a),
          );
          if (edge) updateEdge(edge.id, { isShortestPath: true });
          i++;
        }, 150); // Delay between each segment
      }
    }, 80); // tiny delay so loading state is visible
  };

  const handleReset = () => {
    setSource('');
    setDest('');
    setResult(null);
    clearHighlights();
  };

  const noPath = result && result.path.length === 0;
  const hasPath = result && result.path.length > 0;

  return (
    <div className="space-y-3 pb-10">
      {/* ── Input card ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Navigation2 className="w-4 h-4 text-blue-500" />
            Route Finder
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Dijkstra weighs traffic density automatically.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">From</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                value={source}
                onChange={e => setSource(e.target.value)}
              >
                <option value="">Node…</option>
                {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                value={dest}
                onChange={e => setDest(e.target.value)}
              >
                <option value="">Node…</option>
                {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleFind}
              disabled={!source || !dest || source === dest || loading}
              className="flex-1 gap-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Finding…
                </span>
              ) : (
                <>
                  <Navigation2 className="w-4 h-4" />
                  Find Route
                </>
              )}
            </Button>
            <Button variant="outline" size="icon" onClick={handleReset} title="Reset">
              <RefreshCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Result card ── */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={noPath ? 'no-path' : 'path'}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {noPath ? (
              <Card className="border-red-400/50">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-3 py-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <p className="font-bold text-red-600 dark:text-red-400">No Route Found</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        All roads between {source} and {dest} may be closed or disconnected.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-blue-400/40 shadow-blue-500/10">
                {/* Blue gradient header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Route className="w-4 h-4 text-white" />
                    <span className="text-white font-bold text-sm">Shortest Route Found</span>
                  </div>
                </div>

                <CardContent className="pt-4 space-y-4">
                  {/* Path visual */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">Path</Label>
                    <div className="flex flex-wrap items-center gap-1">
                      {result!.path.map((node, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <span className={cn(
                            'px-2.5 py-1 rounded-full text-sm font-black',
                            i === 0 ? 'bg-green-500 text-white' :
                            i === result!.path.length - 1 ? 'bg-blue-600 text-white' :
                            'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
                          )}>
                            {node}
                          </span>
                          {i < result!.path.length - 1 && (
                            <span className="text-slate-400 text-sm">→</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <Ruler className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                      <div className="text-lg font-black text-blue-600 dark:text-blue-400">
                        {result!.distance.toFixed(1)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">metres</div>
                    </div>
                    <div className="text-center p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
                      <Clock className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                      <div className="text-lg font-black text-purple-600 dark:text-purple-400">
                        {execTime.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">ms</div>
                    </div>
                    <div className="text-center p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <Navigation2 className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        {result!.visited}
                      </div>
                      <div className="text-[10px] text-muted-foreground">visited</div>
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground text-center">
                    Route highlighted in <span className="text-blue-500 font-bold">blue</span> on the map above.
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

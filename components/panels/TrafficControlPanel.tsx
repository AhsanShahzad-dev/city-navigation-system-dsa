'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useGraphStore, TrafficLevel } from '@/store/useGraphStore';
import { AlertCircle, CheckCircle2, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const TRAFFIC_OPTIONS: { level: TrafficLevel; label: string; icon: typeof CheckCircle2; color: string; ringColor: string }[] = [
  { level: 'low',    label: 'Low',  icon: CheckCircle2,  color: 'bg-green-500',  ringColor: 'ring-green-500' },
  { level: 'medium', label: 'Med',  icon: AlertTriangle, color: 'bg-amber-500',  ringColor: 'ring-amber-500' },
  { level: 'high',   label: 'High', icon: AlertCircle,   color: 'bg-red-500',    ringColor: 'ring-red-500' },
];

export function TrafficControlPanel() {
  const { edges, updateEdge } = useGraphStore();

  return (
    <div className="space-y-3 pb-10">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Traffic Control</CardTitle>
          <p className="text-xs text-muted-foreground">
            Adjust congestion levels and toggle road closures. Routes auto-recalculate.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {edges.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No roads yet. Build some in Graph Builder.</p>
            )}
            {edges.map((edge, idx) => {
              const traffic = edge.data?.traffic ?? 'low';
              const closed  = edge.data?.isClosed ?? false;

              return (
                <motion.div
                  key={edge.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={cn(
                    'rounded-xl border p-3 space-y-3 transition-all',
                    closed
                      ? 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10'
                      : 'border-border bg-muted/20',
                  )}
                >
                  {/* Road header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Traffic colour dot */}
                      <div className={cn(
                        'w-2.5 h-2.5 rounded-full shadow-sm',
                        traffic === 'low' ? 'bg-green-500' :
                        traffic === 'medium' ? 'bg-amber-500' : 'bg-red-500',
                      )} />
                      <span className="font-mono font-bold text-sm">
                        {edge.source} → {edge.target}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        ({edge.data?.distance}m)
                      </span>
                    </div>

                    {/* Close/open toggle */}
                    <button
                      onClick={() => updateEdge(edge.id, { isClosed: !closed })}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all',
                        closed
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/70',
                      )}
                    >
                      {closed ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      {closed ? 'Closed' : 'Open'}
                    </button>
                  </div>

                  {/* Traffic selector */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {TRAFFIC_OPTIONS.map(({ level, label, icon: Icon, color, ringColor }) => {
                      const active = traffic === level && !closed;
                      return (
                        <button
                          key={level}
                          disabled={closed}
                          onClick={() => updateEdge(edge.id, { traffic: level })}
                          className={cn(
                            'flex flex-col items-center py-2 rounded-lg text-xs font-semibold transition-all border',
                            closed && 'opacity-40 cursor-not-allowed',
                            active
                              ? `${color} text-white border-transparent ring-2 ${ringColor}/50 shadow-md scale-105`
                              : 'bg-background border-border hover:bg-muted text-muted-foreground hover:text-foreground',
                          )}
                        >
                          <Icon className="w-3.5 h-3.5 mb-0.5" />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Info note ── */}
      <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-xs text-blue-700 dark:text-blue-300 space-y-1">
        <p className="font-semibold">How traffic affects routing</p>
        <p className="text-blue-600/80 dark:text-blue-400/80">
          Medium traffic × 1.5 weight &nbsp;·&nbsp; High traffic × 3.0 weight.
          Closed roads are unreachable.
        </p>
      </div>
    </div>
  );
}

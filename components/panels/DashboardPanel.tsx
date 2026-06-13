'use client';

import { useGraphStore } from '@/store/useGraphStore';
import { useAlgorithmStore } from '@/store/useAlgorithmStore';
import { Navigation2, Network, Activity, BarChart3, LayoutDashboard, Cpu, Route, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function DashboardPanel() {
  const { nodes, edges, setMode } = useGraphStore();
  const { activeAlgorithm, steps, currentStepIndex } = useAlgorithmStore();

  const openRoads   = edges.filter(e => !e.data?.isClosed).length;
  const closedRoads = edges.filter(e =>  e.data?.isClosed).length;
  const highTraffic = edges.filter(e =>  e.data?.traffic === 'high' && !e.data?.isClosed).length;

  const QUICK_ACTIONS = [
    { label: 'Find Route',     icon: Navigation2, mode: 'navigation' as const, color: 'from-blue-500 to-indigo-600' },
    { label: 'Build Graph',    icon: Network,     mode: 'build'      as const, color: 'from-emerald-500 to-teal-600' },
    { label: 'Run Algorithm',  icon: Cpu,         mode: 'algorithms' as const, color: 'from-purple-500 to-violet-600' },
    { label: 'Manage Traffic', icon: Activity,    mode: 'traffic'    as const, color: 'from-amber-500 to-orange-600' },
  ] as const;

  return (
    <div className="space-y-3 pb-10">
      {/* Hero banner */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4 text-white shadow-xl shadow-blue-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4" />
          <span className="font-black text-sm">Smart City Navigator</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/15 rounded-xl py-2">
            <div className="text-2xl font-black">{nodes.length}</div>
            <div className="text-[10px] opacity-80 uppercase tracking-wider">Nodes</div>
          </div>
          <div className="bg-white/15 rounded-xl py-2">
            <div className="text-2xl font-black">{openRoads}</div>
            <div className="text-[10px] opacity-80 uppercase tracking-wider">Roads</div>
          </div>
          <div className="bg-white/15 rounded-xl py-2">
            <div className={cn('text-2xl font-black', highTraffic > 0 ? 'text-red-300' : '')}>
              {highTraffic}
            </div>
            <div className="text-[10px] opacity-80 uppercase tracking-wider">Hi-Traffic</div>
          </div>
        </div>
      </div>

      {/* Status indicators */}
      {closedRoads > 0 && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <p className="text-xs text-red-700 dark:text-red-300 font-semibold">
            {closedRoads} road{closedRoads > 1 ? 's' : ''} currently closed
          </p>
        </div>
      )}

      {activeAlgorithm && (
        <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold capitalize">
            {activeAlgorithm} running · step {currentStepIndex + 1}/{steps.length}
          </p>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1 mb-2 font-semibold">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map(({ label, icon: Icon, mode, color }, i) => (
            <motion.button
              key={mode}
              onClick={() => setMode(mode)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border bg-card hover:bg-muted transition-all hover:shadow-md hover:-translate-y-0.5 text-center"
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-semibold leading-tight">{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-xl bg-muted/60 border p-3 text-xs space-y-1.5">
        <p className="font-bold text-foreground/80">💡 Tips</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Drag nodes to rearrange the map</li>
          <li>• Scroll to zoom, drag to pan</li>
          <li>• Double-click map to fit view</li>
          <li>• <span className="font-semibold">Viva Mode</span> hides UI for demos</li>
        </ul>
      </div>
    </div>
  );
}

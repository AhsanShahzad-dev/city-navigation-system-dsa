'use client';

import { useGraphStore } from '@/store/useGraphStore';
import { useAlgorithmStore } from '@/store/useAlgorithmStore';
import { Navigation2, Network, Route, Activity, BarChart3, LayoutDashboard, TrendingUp, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { AppMode } from '@/store/useGraphStore';

const NAV_ITEMS = [
  { id: 'dashboard'  as AppMode, label: 'Dashboard',      icon: LayoutDashboard, color: 'from-slate-500  to-slate-600' },
  { id: 'navigation' as AppMode, label: 'Navigation',     icon: Navigation2,     color: 'from-blue-500   to-indigo-600' },
  { id: 'build'      as AppMode, label: 'Graph Builder',  icon: Network,         color: 'from-emerald-500 to-teal-600' },
  { id: 'algorithms' as AppMode, label: 'Algorithms',     icon: Cpu,             color: 'from-purple-500 to-violet-600' },
  { id: 'traffic'    as AppMode, label: 'Traffic Control',icon: Activity,        color: 'from-amber-500  to-orange-600' },
  { id: 'analytics'  as AppMode, label: 'Analytics',      icon: BarChart3,       color: 'from-pink-500   to-rose-600' },
] as const;

export function Sidebar() {
  const { mode, setMode, nodes, edges } = useGraphStore();
  const { activeAlgorithm, steps, currentStepIndex } = useAlgorithmStore();

  return (
    <div className="w-60 h-full flex flex-col bg-card/80 backdrop-blur-xl border-r border-border/50 shadow-xl z-30">
      {/* ── Logo ── */}
      <div className="px-5 py-5 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-black text-sm leading-none">SmartCity</h1>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">DSA Navigator</p>
          </div>
        </div>
      </div>

      {/* ── Live stats strip ── */}
      <div className="px-4 py-3 border-b border-border/40 flex gap-4 text-center">
        <div className="flex-1">
          <div className="text-base font-black">{nodes.length}</div>
          <div className="text-[9px] uppercase text-muted-foreground tracking-wider">Nodes</div>
        </div>
        <div className="w-px bg-border" />
        <div className="flex-1">
          <div className="text-base font-black">{edges.length}</div>
          <div className="text-[9px] uppercase text-muted-foreground tracking-wider">Roads</div>
        </div>
        {activeAlgorithm && (
          <>
            <div className="w-px bg-border" />
            <div className="flex-1">
              <div className="text-base font-black text-blue-500">{currentStepIndex + 1}/{steps.length}</div>
              <div className="text-[9px] uppercase text-muted-foreground tracking-wider">Step</div>
            </div>
          </>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon, color }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative',
                active
                  ? 'text-white shadow-md'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {active && (
                <motion.div
                  layoutId="active-pill"
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${color}`}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <div className={cn(
                'relative z-10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0',
                active ? 'bg-white/20' : `bg-gradient-to-br ${color} opacity-70`,
              )}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="relative z-10 text-[13px]">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="px-4 py-3 border-t border-border/40 text-[10px] text-muted-foreground/60 text-center">
        DSA Final Project · 2024
      </div>
    </div>
  );
}

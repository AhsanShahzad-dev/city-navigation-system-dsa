'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useGraphStore } from '@/store/useGraphStore';
import { useAlgorithmStore, AlgorithmType } from '@/store/useAlgorithmStore';
import { generateDijkstraSteps, generateBFSSteps, generateDFSSteps } from '@/lib/algorithms';
import {
  Play, Pause, SkipBack, SkipForward, RotateCcw,
  GitBranch, Layers, Network,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const ALGORITHMS = [
  {
    id: 'dijkstra' as AlgorithmType,
    name: 'Dijkstra',
    full: "Dijkstra's Algorithm",
    icon: Network,
    color: 'from-blue-500 to-indigo-600',
    badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    complexity: { time: 'O((V+E) log V)', space: 'O(V)' },
    desc: 'Finds the shortest weighted path using a priority queue. Edge weights account for traffic density.',
    needsDest: true,
  },
  {
    id: 'bfs' as AlgorithmType,
    name: 'BFS',
    full: 'Breadth-First Search',
    icon: Layers,
    color: 'from-emerald-500 to-teal-600',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    desc: 'Explores all neighbors level-by-level. Ideal for shortest-hop count in unweighted graphs.',
    needsDest: false,
  },
  {
    id: 'dfs' as AlgorithmType,
    name: 'DFS',
    full: 'Depth-First Search',
    icon: GitBranch,
    color: 'from-orange-500 to-red-600',
    badge: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
    complexity: { time: 'O(V + E)', space: 'O(V)' },
    desc: 'Explores as deep as possible before backtracking. Useful for cycle detection and path enumeration.',
    needsDest: false,
  },
] as const;

export function AlgorithmsPanel() {
  const { nodes, edges, clearHighlights } = useGraphStore();
  const {
    activeAlgorithm, setActiveAlgorithm, setSteps,
    steps, currentStepIndex, isPlaying, togglePlay,
    nextStep, prevStep, setSpeed, playbackSpeed, resetAlgorithm,
  } = useAlgorithmStore();

  const [source, setSource] = useState('');
  const [dest, setDest] = useState('');
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeAlgoMeta = ALGORITHMS.find(a => a.id === activeAlgorithm);

  // ── playback timer ──
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        nextStep();
      }, 1000 / playbackSpeed);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current); };
  }, [isPlaying, playbackSpeed, nextStep]);

  const handleStart = (algoId: AlgorithmType) => {
    if (!source) return;
    if (algoId === 'dijkstra' && !dest) return;

    clearHighlights();
    setActiveAlgorithm(algoId);

    let gen: Generator | undefined;
    if (algoId === 'dijkstra') gen = generateDijkstraSteps(nodes, edges, source, dest);
    else if (algoId === 'bfs')  gen = generateBFSSteps(nodes, edges, source);
    else if (algoId === 'dfs')  gen = generateDFSSteps(nodes, edges, source);

    if (gen) {
      const all: import('@/store/useAlgorithmStore').AlgorithmStep[] = [];
      for (const step of gen) all.push(step as any);
      setSteps(all);
    }
  };

  const handleReset = () => {
    resetAlgorithm();
    clearHighlights();
    setSource('');
    setDest('');
  };

  const progress = steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;

  return (
    <div className="space-y-3 pb-10">
      {/* ── Config card ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Algorithm Visualizer</CardTitle>
          <p className="text-xs text-muted-foreground">
            Watch algorithms traverse the city map in real-time.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Node selectors */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Source</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm disabled:opacity-50"
                value={source}
                onChange={e => setSource(e.target.value)}
                disabled={!!activeAlgorithm}
              >
                <option value="">Node…</option>
                {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Dest (Dijkstra)</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm disabled:opacity-50"
                value={dest}
                onChange={e => setDest(e.target.value)}
                disabled={!!activeAlgorithm}
              >
                <option value="">Node…</option>
                {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
              </select>
            </div>
          </div>

          {/* Algorithm picker */}
          <AnimatePresence mode="wait">
            {!activeAlgorithm ? (
              <motion.div
                key="picker"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-2"
              >
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">Choose Algorithm</Label>
                {ALGORITHMS.map(algo => {
                  const Icon = algo.icon;
                  const disabled = !source || (algo.id === 'dijkstra' && !dest);
                  return (
                    <button
                      key={algo.id}
                      onClick={() => handleStart(algo.id)}
                      disabled={disabled}
                      className={cn(
                        'w-full text-left p-3 rounded-xl border transition-all duration-200',
                        'bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed',
                        'hover:border-primary/50 hover:shadow-sm',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${algo.color}`}>
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{algo.full}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{algo.desc}</div>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-2 pl-10">
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold', algo.badge)}>
                          Time: {algo.complexity.time}
                        </span>
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold', algo.badge)}>
                          Space: {algo.complexity.space}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="controls"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                {/* Active algo badge */}
                {activeAlgoMeta && (
                  <div className={`flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r ${activeAlgoMeta.color}`}>
                    <activeAlgoMeta.icon className="w-4 h-4 text-white" />
                    <span className="text-white font-bold text-sm">{activeAlgoMeta.full}</span>
                  </div>
                )}

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Step {currentStepIndex + 1}</span>
                    <span>{steps.length} total</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={cn(
                        'h-full rounded-full',
                        activeAlgoMeta?.id === 'dijkstra' ? 'bg-blue-500' :
                        activeAlgoMeta?.id === 'bfs' ? 'bg-emerald-500' : 'bg-orange-500'
                      )}
                      style={{ width: `${progress}%` }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    />
                  </div>
                </div>

                {/* Playback buttons */}
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={prevStep} disabled={currentStepIndex === 0}>
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    className={cn('h-9 w-9', isPlaying ? 'bg-amber-500 hover:bg-amber-600' : '')}
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9" onClick={nextStep} disabled={currentStepIndex >= steps.length - 1}>
                    <SkipForward className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="icon" className="h-9 w-9" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                {/* Speed selector */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Speed</Label>
                  <div className="grid grid-cols-4 gap-1">
                    {[0.5, 1, 2, 4].map(s => (
                      <button
                        key={s}
                        onClick={() => setSpeed(s)}
                        className={cn(
                          'py-1.5 rounded-lg text-xs font-bold border transition-all',
                          playbackSpeed === s
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-background text-muted-foreground hover:bg-muted border-border',
                        )}
                      >
                        {s}×
                      </button>
                    ))}
                  </div>
                </div>

                {/* Complexity reminder */}
                {activeAlgoMeta && (
                  <div className="rounded-lg bg-muted/60 p-2.5 text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time complexity</span>
                      <span className="font-mono font-bold">{activeAlgoMeta.complexity.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Space complexity</span>
                      <span className="font-mono font-bold">{activeAlgoMeta.complexity.space}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}

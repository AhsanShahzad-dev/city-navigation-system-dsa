'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  ReactFlowProvider,
  BackgroundVariant,
  Panel,
  useReactFlow,
  NodeTypes,
  EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useGraphStore } from '@/store/useGraphStore';
import { useAlgorithmStore } from '@/store/useAlgorithmStore';
import { IntersectionNode } from './IntersectionNode';
import { RoadEdge } from './RoadEdge';
import { useTheme } from 'next-themes';
import { Maximize2, Crosshair, ZoomIn, ZoomOut } from 'lucide-react';
import { motion } from 'framer-motion';

const nodeTypes: NodeTypes = { intersection: IntersectionNode as any };
const edgeTypes: EdgeTypes = { road: RoadEdge as any };

// ─── Algorithm HUD overlay (lives on the map canvas) ────────────────────────
function AlgorithmHUD() {
  const { steps, currentStepIndex, activeAlgorithm } = useAlgorithmStore();
  const currentStep = steps[currentStepIndex];

  if (!currentStep || !activeAlgorithm) return null;

  const algoColors: Record<string, string> = {
    dijkstra: 'from-blue-600 to-indigo-600',
    bfs: 'from-green-600 to-teal-600',
    dfs: 'from-orange-600 to-red-600',
  };

  const label: Record<string, string> = {
    dijkstra: 'Dijkstra',
    bfs: 'BFS',
    dfs: 'DFS',
  };

  return (
    <Panel position="top-right" className="m-4">
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-72 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${algoColors[activeAlgorithm] ?? 'from-slate-600 to-slate-700'} px-4 py-3 flex items-center justify-between`}>
          <span className="text-white font-bold text-sm">{label[activeAlgorithm] ?? activeAlgorithm} Visualizer</span>
          <span className="text-white/70 text-xs">Step {currentStepIndex + 1} / {steps.length}</span>
        </div>

        {/* Description */}
        <div className="bg-slate-900/90 backdrop-blur-md px-4 py-3 border-b border-white/10">
          <p className="text-white/90 text-xs leading-relaxed">{currentStep.description}</p>
        </div>

        {/* State rows */}
        <div className="bg-slate-800/90 backdrop-blur-md px-4 py-3 space-y-3">
          {/* Current node */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
            <span className="text-slate-400 text-xs w-20 shrink-0">Current</span>
            <span className="text-yellow-300 font-mono font-bold text-xs">
              {currentStep.currentNode ?? '–'}
            </span>
          </div>

          {/* Queue / Stack */}
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-400 shrink-0 mt-0.5" />
            <span className="text-slate-400 text-xs w-20 shrink-0">
              {activeAlgorithm === 'dfs' ? 'Stack' : 'Queue'}
            </span>
            <div className="flex flex-wrap gap-1">
              {currentStep.queueOrStack.length > 0
                ? currentStep.queueOrStack.map((q, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-orange-500/20 text-orange-300 text-[10px] font-mono rounded border border-orange-500/30">
                      {q}
                    </span>
                  ))
                : <span className="text-slate-500 text-xs">empty</span>
              }
            </div>
          </div>

          {/* Visited */}
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0 mt-0.5" />
            <span className="text-slate-400 text-xs w-20 shrink-0">Visited</span>
            <div className="flex flex-wrap gap-1">
              {currentStep.visitedNodes.length > 0
                ? currentStep.visitedNodes.map((n, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-mono rounded border border-blue-500/30">
                      {n}
                    </span>
                  ))
                : <span className="text-slate-500 text-xs">none</span>
              }
            </div>
          </div>

          {/* Dijkstra distances mini-table */}
          {activeAlgorithm === 'dijkstra' && Object.keys(currentStep.distances).length > 0 && (
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-0.5" />
              <span className="text-slate-400 text-xs w-20 shrink-0">Distances</span>
              <div className="flex flex-wrap gap-1">
                {Object.entries(currentStep.distances).map(([node, dist]) => (
                  <span
                    key={node}
                    className={`px-1.5 py-0.5 text-[10px] font-mono rounded border ${
                      dist === Infinity
                        ? 'bg-slate-700/50 text-slate-500 border-slate-600/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {node}:{dist === Infinity ? '∞' : dist}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </Panel>
  );
}

// ─── Custom map controls ─────────────────────────────────────────────────────
function MapControls() {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const { presentationMode } = useGraphStore();

  if (presentationMode) return null;

  return (
    <Panel position="bottom-right" className="mb-4 mr-4 flex flex-col gap-2">
      {/* Zoom controls */}
      <div className="flex flex-col rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => zoomIn({ duration: 300 })}
          className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-200 dark:border-slate-700"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </button>
        <button
          onClick={() => zoomOut({ duration: 300 })}
          className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </button>
      </div>

      {/* Fit view */}
      <button
        onClick={() => fitView({ duration: 500, padding: 0.15 })}
        className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        title="Fit all nodes"
      >
        <Maximize2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
      </button>

      {/* Reset view */}
      <button
        onClick={() => fitView({ duration: 500, padding: 0.15 })}
        className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        title="Reset view"
      >
        <Crosshair className="w-4 h-4 text-slate-600 dark:text-slate-300" />
      </button>
    </Panel>
  );
}

// ─── Legend ──────────────────────────────────────────────────────────────────
function MapLegend() {
  const { presentationMode } = useGraphStore();
  if (presentationMode) return null;

  return (
    <Panel position="bottom-left" className="mb-4 ml-4">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl p-3 shadow-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
        <p className="font-bold text-slate-700 dark:text-slate-200 mb-2 uppercase tracking-wider text-[10px]">Legend</p>
        {[
          { color: 'bg-green-500',  label: 'Low Traffic' },
          { color: 'bg-amber-500',  label: 'Medium Traffic' },
          { color: 'bg-red-500',    label: 'High Traffic' },
          { color: 'bg-blue-500',   label: 'Shortest Path' },
          { color: 'bg-orange-400', label: 'Edge Relaxation' },
          { color: 'bg-yellow-400', label: 'Current Node' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color} shadow-sm`} />
            <span className="text-slate-600 dark:text-slate-400">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-0.5">
          <div className="w-6 h-0 border-t-2 border-dashed border-red-500" />
          <span className="text-slate-600 dark:text-slate-400">Closed Road</span>
        </div>
      </div>
    </Panel>
  );
}

// ─── Flow inner component ─────────────────────────────────────────────────────
function Flow() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, presentationMode } = useGraphStore();
  const { fitView } = useReactFlow();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fit view whenever nodes change (e.g. node added)
  useEffect(() => {
    if (!mounted) return;
    const timer = setTimeout(() => fitView({ duration: 400, padding: 0.15 }), 100);
    return () => clearTimeout(timer);
  }, [nodes.length, mounted]);

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      proOptions={{ hideAttribution: true }}
      minZoom={0.3}
      maxZoom={4}
      panOnDrag
      zoomOnScroll
      zoomOnDoubleClick={false}
      onDoubleClick={(e) => {
        // Double-click on background → fit view (center on graph)
        fitView({ duration: 500, padding: 0.15 });
      }}
      defaultEdgeOptions={{ type: 'road' }}
      className="!bg-transparent"
    >
      {/* Google-Maps-style background */}
      <Background
        color={isDark ? '#1e293b' : '#e2e8f0'}
        variant={BackgroundVariant.Lines}
        gap={40}
        lineWidth={isDark ? 0.5 : 1}
        style={{ background: isDark ? '#0f172a' : '#f1f5f9' }}
      />

      {/* MiniMap */}
      {!presentationMode && (
        <MiniMap
          nodeColor={isDark ? '#38bdf8' : '#3b82f6'}
          maskColor={isDark ? 'rgba(15,23,42,0.75)' : 'rgba(241,245,249,0.75)'}
          className="!rounded-xl !border-slate-200 dark:!border-slate-700 !shadow-xl"
          style={{ background: isDark ? '#1e293b' : '#fff' }}
        />
      )}

      {/* Algorithm HUD (map-embedded) */}
      <AlgorithmHUD />

      {/* Custom controls */}
      <MapControls />

      {/* Legend */}
      <MapLegend />
    </ReactFlow>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
export function CityMap() {
  return (
    <div className="w-full h-full bg-slate-100 dark:bg-slate-900">
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </div>
  );
}

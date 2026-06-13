'use client';

import { useGraphStore } from '@/store/useGraphStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Network, Hash, Route, MapPin, Activity } from 'lucide-react';
import { useStore } from '@xyflow/react';

export function NodeInfoPanel() {
  const { nodes, edges } = useGraphStore();
  
  // Get exactly one selected node
  const selectedNodes = useStore(s => Array.from(s.nodeLookup.values()).filter(n => n.selected));
  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null;

  if (!selectedNode) return null;

  const connectedEdges = edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id);
  const degree = connectedEdges.length;
  const neighbors = connectedEdges.map(e => e.source === selectedNode.id ? e.target : e.source);
  
  const trafficLevels = connectedEdges.map(e => e.data?.traffic || 'low');
  const highestTraffic = trafficLevels.includes('high') ? 'high' : trafficLevels.includes('medium') ? 'medium' : 'low';
  const closedRoads = connectedEdges.filter(e => e.data?.isClosed).length;

  return (
    <div className="absolute left-4 bottom-4 z-40 pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-2 text-white">
          <Info className="w-4 h-4" />
          <span className="font-bold text-sm">Node Information</span>
        </div>

        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{selectedNode.data?.label || selectedNode.id}</h3>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Intersection {selectedNode.id}</p>
            </div>
            <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-500">
              x: {Math.round(selectedNode.position.x)}, y: {Math.round(selectedNode.position.y)}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Hash className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase font-bold">Degree</span>
              </div>
              <span className="text-lg font-black text-slate-700 dark:text-slate-200">{degree}</span>
            </div>
            
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Route className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase font-bold">Roads</span>
              </div>
              <span className="text-lg font-black text-slate-700 dark:text-slate-200">{connectedEdges.length}</span>
            </div>
          </div>

          {/* Traffic Status */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <Activity className="w-4 h-4" /> Local Traffic
            </div>
            <div className={`px-2 py-0.5 rounded text-xs font-bold ${
              highestTraffic === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              highestTraffic === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            }`}>
              {highestTraffic.toUpperCase()}
            </div>
          </div>

          {/* Neighbors List */}
          <div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5" /> Connected Neighbors
            </p>
            <div className="flex flex-wrap gap-1.5">
              {neighbors.length > 0 ? neighbors.map(n => (
                <span key={n} className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 rounded-md text-xs font-mono font-bold shadow-sm">
                  {n}
                </span>
              )) : (
                <span className="text-xs text-slate-400 italic">No connections</span>
              )}
            </div>
            {closedRoads > 0 && (
              <p className="text-[10px] text-red-500 mt-2 font-semibold">⚠️ {closedRoads} connected road(s) closed</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

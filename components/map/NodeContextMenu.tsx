'use client';

import { useGraphStore } from '@/store/useGraphStore';
import { useAlgorithmStore } from '@/store/useAlgorithmStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, MapPin, Navigation, Trash2, Edit3, Route } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { generateBFSSteps, generateDFSSteps, generateDijkstraSteps } from '@/lib/algorithms';

interface NodeContextMenuProps {
  nodeId: string;
  top: number;
  left: number;
  onClose: () => void;
}

export function NodeContextMenu({ nodeId, top, left, onClose }: NodeContextMenuProps) {
  const { nodes, edges, setMode, deleteNode } = useGraphStore();
  const { setSteps, setActiveAlgorithm } = useAlgorithmStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside the menu but not on a pane (handled by reactflow)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [onClose]);

  const runAlgorithm = (type: 'bfs' | 'dfs' | 'dijkstra') => {
    setActiveAlgorithm(type);
    
    // Default target for Dijkstra (pick furthest or just first other node)
    const target = nodes.find(n => n.id !== nodeId)?.id || nodeId;
    
    let gen;
    if (type === 'bfs') gen = generateBFSSteps(nodes, edges, nodeId);
    if (type === 'dfs') gen = generateDFSSteps(nodes, edges, nodeId);
    if (type === 'dijkstra') gen = generateDijkstraSteps(nodes, edges, nodeId, target);

    if (gen) {
      const all: import('@/store/useAlgorithmStore').AlgorithmStep[] = [];
      for (const step of gen) all.push(step as any);
      setSteps(all);
    }
    setMode('algorithms');
    onClose();
  };

  const menuItems = [
    { label: 'Set as Source', icon: Navigation, onClick: () => { setMode('navigation'); onClose(); }, color: 'text-blue-400' },
    { label: 'Set as Destination', icon: MapPin, onClick: () => { setMode('navigation'); onClose(); }, color: 'text-rose-400' },
    null, // divider
    { label: 'Run BFS', icon: Route, onClick: () => runAlgorithm('bfs') },
    { label: 'Run DFS', icon: Route, onClick: () => runAlgorithm('dfs') },
    { label: 'Run Dijkstra', icon: Play, onClick: () => runAlgorithm('dijkstra') },
    null, // divider
    { label: 'Edit Node', icon: Edit3, onClick: () => { setMode('build'); onClose(); } },
    { label: 'Delete Intersection', icon: Trash2, onClick: () => { deleteNode(nodeId); onClose(); }, color: 'text-red-500 hover:bg-red-500/10' },
  ];

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.15 }}
      className="fixed z-50 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1.5"
      style={{ top, left }}
    >
      <div className="px-3 py-2 border-b border-white/10 mb-1">
        <p className="text-xs font-bold text-white/90">Intersection {nodeId}</p>
        <p className="text-[10px] text-white/50">Node Actions</p>
      </div>

      <div className="flex flex-col">
        {menuItems.map((item, idx) => {
          if (!item) return <div key={idx} className="h-px bg-white/10 my-1 mx-2" />;
          const { label, icon: Icon, onClick, color } = item;
          return (
            <button
              key={label}
              onClick={onClick}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors w-full text-left ${color || ''}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

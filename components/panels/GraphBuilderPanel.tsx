'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useGraphStore } from '@/store/useGraphStore';
import { Plus, Trash2, Network, Route, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function GraphBuilderPanel() {
  const { nodes, edges, addNode, deleteNode, addEdge: addRoad, deleteEdge, resetGraph } = useGraphStore();

  const [nodeName, setNodeName] = useState('');
  const [src, setSrc] = useState('');
  const [dst, setDst] = useState('');
  const [dist, setDist] = useState('10');

  const handleAddNode = () => {
    const id = nodeName.trim().toUpperCase();
    if (!id || nodes.find(n => n.id === id)) return;
    addNode({
      id,
      position: { x: 200 + Math.random() * 400, y: 150 + Math.random() * 300 },
      data: { label: id },
      type: 'intersection',
    });
    setNodeName('');
  };

  const handleAddEdge = () => {
    if (!src || !dst || src === dst) return;
    const d = parseInt(dist);
    if (isNaN(d) || d <= 0) return;
    const id = `e${src}-${dst}`;
    if (edges.find(e => e.id === id)) return;
    addRoad({ id, source: src, target: dst, type: 'road', data: { distance: d, traffic: 'low', isClosed: false } });
    setSrc('');
    setDst('');
    setDist('10');
  };

  return (
    <div className="space-y-3 pb-10">
      {/* ── Add Node ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-800 dark:bg-white flex items-center justify-center">
              <span className="text-[10px] font-black text-white dark:text-slate-900">A</span>
            </div>
            Add Intersection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={nodeName}
              onChange={e => setNodeName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddNode()}
              placeholder="Name (e.g. F)"
              className="uppercase"
              maxLength={4}
            />
            <Button onClick={handleAddNode} size="icon" disabled={!nodeName.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Add Road ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Route className="w-4 h-4 text-blue-500" />
            Add Road
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">From</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={src}
                onChange={e => setSrc(e.target.value)}
              >
                <option value="">Node…</option>
                {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={dst}
                onChange={e => setDst(e.target.value)}
              >
                <option value="">Node…</option>
                {nodes.map(n => n.id !== src && <option key={n.id} value={n.id}>{n.id}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Distance (m)</Label>
            <Input type="number" min={1} value={dist} onChange={e => setDist(e.target.value)} />
          </div>
          <Button onClick={handleAddEdge} className="w-full gap-2" disabled={!src || !dst || src === dst}>
            <Plus className="w-4 h-4" /> Add Road
          </Button>
        </CardContent>
      </Card>

      {/* ── Elements list ── */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Network className="w-4 h-4 text-emerald-500" />
              Graph Elements
            </CardTitle>
            <button
              onClick={resetGraph}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-destructive transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 max-h-52 overflow-y-auto pr-1">
          <AnimatePresence>
            {nodes.map(n => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-700 dark:bg-slate-300 flex items-center justify-center">
                    <span className="text-[10px] font-black text-white dark:text-slate-900">{n.id}</span>
                  </div>
                  <span className="text-sm font-medium">Node {n.id}</span>
                </div>
                <button
                  onClick={() => deleteNode(n.id)}
                  className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {nodes.length > 0 && edges.length > 0 && (
            <div className="my-2 border-t border-dashed" />
          )}

          <AnimatePresence>
            {edges.map(e => (
              <motion.div
                key={e.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    e.data?.traffic === 'high' ? 'bg-red-500' :
                    e.data?.traffic === 'medium' ? 'bg-amber-500' : 'bg-green-500',
                  )} />
                  <span className="font-mono font-semibold">{e.source}→{e.target}</span>
                  <span className="text-muted-foreground">{e.data?.distance}m</span>
                </div>
                <button
                  onClick={() => deleteEdge(e.id)}
                  className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {nodes.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No elements yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

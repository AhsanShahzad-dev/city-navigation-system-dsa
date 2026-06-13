'use client';

import { memo, useState, useId } from 'react';
import { EdgeProps, getStraightPath, BaseEdge, EdgeLabelRenderer, useStore } from '@xyflow/react';
import { RoadEdge as RoadEdgeType } from '@/store/useGraphStore';
import { useAlgorithmStore } from '@/store/useAlgorithmStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export const RoadEdge = memo(function RoadEdge(props: EdgeProps<RoadEdgeType>) {
  const { id, source, target, sourceX, sourceY, targetX, targetY, data, selected } = props;
  const { steps, currentStepIndex } = useAlgorithmStore();
  const [hovered, setHovered] = useState(false);
  const clipId = useId();

  // Read node selection state efficiently using React Flow's internal store
  const isSourceSelected = useStore(s => s.nodeLookup.get(source)?.selected);
  const isTargetSelected = useStore(s => s.nodeLookup.get(target)?.selected);
  const hasAnySelectedNode = useStore(s => Array.from(s.nodeLookup.values()).some(n => n.selected));
  const isConnectedToSelectedNode = isSourceSelected || isTargetSelected;

  const DEBUG = false; // Temporary debug mode
  const NODE_RADIUS = 28; // 56px / 2 (w-14 h-14)
  
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const angleRad = Math.atan2(dy, dx);
  
  const offsetX = NODE_RADIUS * Math.cos(angleRad);
  const offsetY = NODE_RADIUS * Math.sin(angleRad);

  const startX = sourceX + offsetX;
  const startY = sourceY + offsetY;
  const endX = targetX - offsetX;
  const endY = targetY - offsetY;

  const [edgePath, labelX, labelY] = getStraightPath({ 
    sourceX: startX, 
    sourceY: startY, 
    targetX: endX, 
    targetY: endY 
  });

  const currentStep = steps[currentStepIndex];
  const isHighlighted = currentStep?.highlightedEdges.includes(id);

  const isClosed      = data?.isClosed ?? false;
  const isShortestPath = (data?.isShortestPath ?? false) || (isHighlighted && currentStep?.highlightedEdges.length > 0 && !currentStep?.description.includes('complete'));
  const isFinalPath   = (data?.isShortestPath ?? false) || (isHighlighted && currentStep?.description.includes('complete'));
  const traffic       = data?.traffic ?? 'low';
  const distance      = data?.distance ?? '?';

  // ── stroke color ────────────────────────────────────────────────────────────
  let strokeColor = '#94a3b8'; // slate-400 – default road
  if (traffic === 'low')    strokeColor = '#22c55e'; // green-500
  if (traffic === 'medium') strokeColor = '#f59e0b'; // amber-500
  if (traffic === 'high')   strokeColor = '#ef4444'; // red-500
  if (isClosed)             strokeColor = '#ef4444';
  
  // Highlight overrides
  if (isConnectedToSelectedNode) strokeColor = '#3b82f6'; // blue-500 when connected to selected node
  if (isHighlighted)        strokeColor = '#fb923c'; // orange – edge relaxation
  if (isFinalPath)          strokeColor = '#3b82f6'; // blue-500 – shortest path
  // dark mode path
  if (isFinalPath || isConnectedToSelectedNode) strokeColor = 'var(--path, #38bdf8)';

  const strokeWidth   = isFinalPath || isConnectedToSelectedNode ? 7 : isHighlighted ? 5 : selected || hovered ? 5 : 4;
  const glowFilter    = isFinalPath || isConnectedToSelectedNode
    ? 'drop-shadow(0 0 6px rgba(56,189,248,0.9)) drop-shadow(0 0 12px rgba(56,189,248,0.5))'
    : isHighlighted
    ? 'drop-shadow(0 0 5px rgba(251,146,60,0.8))'
    : 'none';

  // Opacity fading for unrelated roads when a node is selected
  const edgeOpacity = hasAnySelectedNode && !isConnectedToSelectedNode ? 0.25 : 1;

  // road length (for particle animation offset)
  const roadLength = Math.hypot(targetX - sourceX, targetY - sourceY);

  // traffic particle speed by level
  const particleSpeed = traffic === 'high' ? 0.6 : traffic === 'medium' ? 1.2 : 2.2;

  return (
    <>
      {/* ── SVG layer ── */}
      <g
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'pointer', opacity: edgeOpacity, transition: 'opacity 0.3s' }}
      >
        {/* Wide invisible hit-target */}
        <path d={edgePath} stroke="transparent" strokeWidth={24} fill="none" />

        {/* Road casing (darker outline) */}
        <path
          d={edgePath}
          stroke={isFinalPath ? 'rgba(14,165,233,0.25)' : 'rgba(0,0,0,0.12)'}
          strokeWidth={strokeWidth + 4}
          fill="none"
          strokeLinecap="round"
        />

        {/* Main road surface */}
        <path
          d={edgePath}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={isClosed ? '8 6' : 'none'}
          style={{
            transition: 'stroke 0.35s ease, stroke-width 0.2s ease',
            filter: glowFilter,
          }}
        />

        {/* Center dashes (lane markings) – only when wide enough */}
        {!isClosed && !isFinalPath && strokeWidth >= 4 && (
          <path
            d={edgePath}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="8 10"
            style={{ pointerEvents: 'none' }}
          />
        )}

        {/* Animated flow particles on the road */}
        {!isClosed && (
          <g style={{ pointerEvents: 'none' }}>
            {[0, 0.33, 0.66].map((offset, i) => (
              <motion.circle
                key={i}
                r={traffic === 'high' ? 3.5 : 2.5}
                fill={
                  traffic === 'high' ? 'rgba(239,68,68,0.85)' :
                  traffic === 'medium' ? 'rgba(245,158,11,0.85)' :
                  'rgba(34,197,94,0.85)'
                }
                style={{ offsetPath: `path("${edgePath}")`, offsetDistance: '0%' }}
                animate={{ offsetDistance: ['0%', '100%'] }}
                transition={{
                  duration: particleSpeed,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: offset * particleSpeed,
                }}
              />
            ))}
          </g>
        )}

        {/* Debug Dots */}
        {DEBUG && (
          <>
            <circle cx={startX} cy={startY} r={4} fill="blue" stroke="white" strokeWidth={1.5} />
            <circle cx={endX} cy={endY} r={4} fill="yellow" stroke="black" strokeWidth={1.5} />
          </>
        )}
      </g>

      {/* ── Distance label ── */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Normal label */}
          <div className={cn(
            'px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md border transition-all duration-200 whitespace-nowrap',
            isFinalPath
              ? 'bg-blue-500 text-white border-blue-600 scale-110'
              : isHighlighted
              ? 'bg-orange-400 text-white border-orange-500 scale-105'
              : isClosed
              ? 'bg-red-100 text-red-700 border-red-300 line-through'
              : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600',
          )}>
            {isClosed ? '⛔' : `${distance}m`}
          </div>

          {/* Hovered extended info */}
          {hovered && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 pointer-events-none">
              <div className="bg-slate-900 text-white rounded-lg px-3 py-2 text-xs shadow-2xl whitespace-nowrap space-y-0.5">
                <div className="font-semibold">Road {id.replace('e','')}</div>
                <div>Distance: {distance}m</div>
                <div>Traffic: <span className={
                  traffic === 'high' ? 'text-red-400' :
                  traffic === 'medium' ? 'text-yellow-400' : 'text-green-400'
                }>{traffic}</span></div>
                {isClosed && <div className="text-red-400 font-bold">🚫 Road Closed</div>}
              </div>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

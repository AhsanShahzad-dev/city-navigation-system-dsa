'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { useGraphStore, IntersectionNode as IntersectionNodeType } from '@/store/useGraphStore';
import { useAlgorithmStore } from '@/store/useAlgorithmStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const IntersectionNode = memo(function IntersectionNode({ id, data, selected }: NodeProps<IntersectionNodeType>) {
  const { steps, currentStepIndex } = useAlgorithmStore();
  const [hovered, setHovered] = useState(false);
  
  const currentStep = steps[currentStepIndex];

  const isCurrentNode = currentStep?.currentNode === id;
  // Queue/stack items look like "A(5)" – extract just the node id for matching
  const isInQueue = currentStep?.queueOrStack.some(q => q.split('(')[0] === id);
  const isVisited = currentStep?.visitedNodes.includes(id);

  // Color scheme based on state
  let ringColor = 'ring-slate-300';
  let bgColor = 'bg-white dark:bg-slate-700';
  let glowColor = '';
  let dotColor = 'bg-slate-500';

  if (isCurrentNode) {
    ringColor = 'ring-yellow-400';
    bgColor = 'bg-yellow-50 dark:bg-yellow-900/50';
    glowColor = 'shadow-[0_0_20px_6px_rgba(250,204,21,0.5)]';
    dotColor = 'bg-yellow-500';
  } else if (isVisited) {
    ringColor = 'ring-blue-400 dark:ring-sky-400';
    bgColor = 'bg-blue-50 dark:bg-sky-900/40';
    glowColor = 'shadow-[0_0_14px_4px_rgba(59,130,246,0.4)]';
    dotColor = 'bg-blue-500';
  } else if (isInQueue) {
    ringColor = 'ring-orange-400';
    bgColor = 'bg-orange-50 dark:bg-orange-900/40';
    glowColor = 'shadow-[0_0_12px_4px_rgba(251,146,60,0.4)]';
    dotColor = 'bg-orange-400';
  } else if (selected) {
    ringColor = 'ring-blue-500';
    bgColor = 'bg-blue-100 dark:bg-blue-900/60';
    glowColor = 'shadow-[0_0_24px_8px_rgba(59,130,246,0.6)]';
    dotColor = 'bg-blue-500';
  } else if (hovered) {
    ringColor = 'ring-slate-400';
    glowColor = 'shadow-[0_0_10px_3px_rgba(100,116,139,0.3)]';
  }

  const hasDistance = currentStep?.distances?.[id] !== undefined && currentStep.distances[id] !== Infinity;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Center Handles for accurate edge routing */}
      <Handle type="target" position={Position.Top}    style={{ position: 'absolute', top: '50%', left: '50%', width: 1, height: 1, visibility: 'hidden' }} />
      <Handle type="source" position={Position.Bottom} style={{ position: 'absolute', top: '50%', left: '50%', width: 1, height: 1, visibility: 'hidden' }} />

      {/* Debug center dot (red) */}
      {true && <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none shadow-[0_0_0_2px_white]" />}

      {/* Dijkstra distance badge (above node) */}
      <AnimatePresence>
        {hasDistance && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap"
          >
            <div className="px-2 py-0.5 rounded-md bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-mono font-bold shadow-lg">
              d={currentStep!.distances[id]}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main intersection node */}
      <motion.div
        animate={{
          scale: isCurrentNode ? 1.25 : selected ? 1.1 : 1,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={cn(
          'relative flex flex-col items-center justify-center',
          'w-14 h-14 rounded-full',
          'border-[3px]',
          'ring-4 ring-offset-1 ring-offset-transparent',
          'transition-colors duration-300',
          bgColor,
          ringColor,
          glowColor,
          'shadow-lg cursor-pointer select-none',
        )}
      >
        {/* Center dot (intersection indicator) */}
        <div className={cn('w-2 h-2 rounded-full absolute', dotColor)} />

        {/* Label */}
        <span className={cn(
          'font-black text-sm leading-none mt-3 z-10',
          isCurrentNode ? 'text-yellow-800 dark:text-yellow-200' :
          isVisited ? 'text-blue-700 dark:text-sky-200' :
          isInQueue ? 'text-orange-700 dark:text-orange-200' :
          'text-slate-700 dark:text-slate-200',
        )}>
          {data.label || id}
        </span>

        {/* Pulsing ring when current */}
        {isCurrentNode && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-yellow-400"
            animate={{ scale: [1, 1.5, 1.5], opacity: [0.9, 0, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </motion.div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hovered && !isCurrentNode && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.9 }}
            animate={{ opacity: 1, y: -6, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-20 pointer-events-none"
          >
            <div className="px-2 py-1 rounded bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-xl">
              Intersection {id}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

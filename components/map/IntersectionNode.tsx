import { Handle, Position, NodeProps } from '@xyflow/react';
import { useGraphStore, IntersectionNode as IntersectionNodeType } from '@/store/useGraphStore';
import { cn } from '@/lib/utils';
import { useAlgorithmStore } from '@/store/useAlgorithmStore';

export function IntersectionNode({ id, data, selected }: NodeProps<IntersectionNodeType>) {
  const { mode } = useGraphStore();
  const { steps, currentStepIndex } = useAlgorithmStore();
  
  const currentStep = steps[currentStepIndex];
  
  // Algorithm highlighting logic
  const isCurrentNode = currentStep?.currentNode === id;
  const isVisited = currentStep?.visitedNodes.includes(id);
  const isInQueue = currentStep?.queueOrStack.includes(id);

  return (
    <div 
      className={cn(
        "relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border-2",
        "bg-card text-card-foreground",
        selected && "ring-4 ring-primary border-primary",
        !selected && "border-border/50",
        
        // Algorithm styling
        isCurrentNode && "bg-yellow-400 border-yellow-500 text-black scale-110 shadow-yellow-400/50",
        isVisited && !isCurrentNode && "bg-blue-500 border-blue-400 text-white shadow-blue-500/30",
        isInQueue && !isCurrentNode && !isVisited && "bg-orange-300 border-orange-400 text-black",
        
        // Default glow
        !isCurrentNode && !isVisited && "dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
      )}
    >
      <Handle type="target" position={Position.Top} className="opacity-0 w-full h-full absolute" />
      <span className="font-bold text-sm pointer-events-none">{data.label || id}</span>
      
      {/* Node distance label for Dijkstra */}
      {currentStep?.distances?.[id] !== undefined && currentStep.distances[id] !== Infinity && (
        <div className="absolute -top-6 bg-background/80 px-2 py-0.5 rounded text-xs font-mono border">
          {currentStep.distances[id]}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="opacity-0 w-full h-full absolute" />
    </div>
  );
}

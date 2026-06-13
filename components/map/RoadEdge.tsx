import { EdgeProps, getBezierPath, BaseEdge, EdgeLabelRenderer } from '@xyflow/react';
import { RoadEdge as RoadEdgeType } from '@/store/useGraphStore';
import { cn } from '@/lib/utils';
import { useAlgorithmStore } from '@/store/useAlgorithmStore';

export function RoadEdge(props: EdgeProps<RoadEdgeType>) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, data, selected } = props;
  const { steps, currentStepIndex } = useAlgorithmStore();
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const currentStep = steps[currentStepIndex];
  const isHighlighted = currentStep?.highlightedEdges.includes(id);

  // Styling based on properties
  const isClosed = data?.isClosed;
  const isShortestPath = data?.isShortestPath || isHighlighted;
  const traffic = data?.traffic || 'low';

  // Base styling for traffic
  let strokeColor = "var(--road)"; // default Road color #64748B / #475569
  if (traffic === 'low') strokeColor = "var(--traffic-low)";
  if (traffic === 'medium') strokeColor = "var(--traffic-medium)";
  if (traffic === 'high') strokeColor = "var(--traffic-high)";

  if (isClosed) {
    strokeColor = "var(--traffic-high)"; // Red dashed
  }

  if (isShortestPath) {
    strokeColor = "var(--path)"; // Bright Blue
  }

  return (
    <>
      {/* Outer invisible path for easier clicking */}
      <BaseEdge path={edgePath} stroke="transparent" strokeWidth={20} />
      
      {/* Actual visual road path */}
      <BaseEdge 
        id={id} 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{
          stroke: strokeColor,
          strokeWidth: isShortestPath ? 6 : 4,
          strokeDasharray: isClosed ? '5,5' : 'none',
          opacity: isClosed ? 0.6 : 1,
          transition: 'all 0.3s ease',
          filter: isShortestPath ? 'drop-shadow(0 0 8px var(--path))' : 'none'
        }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div className={cn(
            "px-2 py-1 rounded-md text-xs font-bold glass shadow-sm",
            isShortestPath ? "bg-blue-500/20 text-blue-700 dark:text-blue-300" : "bg-background/80 text-foreground"
          )}>
            {data?.distance}m
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

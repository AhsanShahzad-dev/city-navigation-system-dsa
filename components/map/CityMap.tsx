import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  BackgroundVariant,
  Panel
} from '@xyflow/react';
import { useGraphStore } from '@/store/useGraphStore';
import { IntersectionNode } from './IntersectionNode';
import { RoadEdge } from './RoadEdge';
import { useTheme } from 'next-themes';
import { NodeTypes, EdgeTypes } from '@xyflow/react';

const nodeTypes: NodeTypes = { intersection: IntersectionNode as any };
const edgeTypes: EdgeTypes = { road: RoadEdge as any };

function Flow() {
  const { theme } = useTheme();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, mode, presentationMode } = useGraphStore();

  const isDarkMode = theme === 'dark';

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
      className="bg-background"
      proOptions={{ hideAttribution: true }}
      minZoom={0.5}
      maxZoom={3}
    >
      <Background 
        color={isDarkMode ? '#334155' : '#CBD5E1'} 
        variant={BackgroundVariant.Dots} 
        gap={20} 
        size={2} 
      />
      {!presentationMode && (
        <>
          <Controls className="glass rounded-xl overflow-hidden border-none" showInteractive={false} />
          <MiniMap 
            nodeColor={isDarkMode ? '#38BDF8' : '#3B82F6'} 
            maskColor={isDarkMode ? 'rgba(15, 23, 42, 0.7)' : 'rgba(248, 250, 252, 0.7)'} 
            className="glass rounded-xl overflow-hidden border-none shadow-xl"
          />
        </>
      )}
      
      {/* Visual map legend */}
      {!presentationMode && (
         <Panel position="bottom-right" className="glass p-4 rounded-xl text-xs space-y-2 mb-4 mr-4">
           <h4 className="font-semibold mb-2">Legend</h4>
           <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[var(--traffic-low)]"></div>Low Traffic</div>
           <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[var(--traffic-medium)]"></div>Medium Traffic</div>
           <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[var(--traffic-high)]"></div>High Traffic</div>
           <div className="flex items-center gap-2"><div className="w-4 h-0.5 border-t-2 border-dashed border-[var(--traffic-high)]"></div>Closed Road</div>
           <div className="flex items-center gap-2"><div className="w-4 h-1 bg-[var(--path)]"></div>Shortest Path</div>
         </Panel>
      )}
    </ReactFlow>
  );
}

export function CityMap() {
  return (
    <div className="w-full h-full">
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </div>
  );
}

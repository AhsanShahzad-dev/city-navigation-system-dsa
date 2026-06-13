import { create } from 'zustand';
import { Node, Edge, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, Connection } from '@xyflow/react';

export type TrafficLevel = 'low' | 'medium' | 'high';

export interface IntersectionData extends Record<string, unknown> {
  label: string;
}

export interface RoadData extends Record<string, unknown> {
  distance: number;
  traffic: TrafficLevel;
  isClosed: boolean;
  isShortestPath?: boolean;
}

export type IntersectionNode = Node<IntersectionData>;
export type RoadEdge = Edge<RoadData>;

export type AppMode = 'dashboard' | 'build' | 'navigation' | 'traffic' | 'algorithms' | 'analytics';

interface GraphState {
  nodes: IntersectionNode[];
  edges: RoadEdge[];
  mode: AppMode;
  presentationMode: boolean;
  
  // Actions
  setMode: (mode: AppMode) => void;
  togglePresentationMode: () => void;
  
  // React Flow handlers
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  // Graph Builders
  addNode: (node: IntersectionNode) => void;
  updateNode: (id: string, data: Partial<IntersectionData>) => void;
  deleteNode: (id: string) => void;
  
  addEdge: (edge: RoadEdge) => void;
  updateEdge: (id: string, data: Partial<RoadData>) => void;
  deleteEdge: (id: string) => void;
  
  // Resets
  resetGraph: () => void;
  clearHighlights: () => void;
}

const initialNodes: IntersectionNode[] = [
  { id: 'A', position: { x: 250, y: 150 }, data: { label: 'A' }, type: 'intersection' },
  { id: 'B', position: { x: 500, y: 100 }, data: { label: 'B' }, type: 'intersection' },
  { id: 'C', position: { x: 750, y: 200 }, data: { label: 'C' }, type: 'intersection' },
  { id: 'D', position: { x: 400, y: 350 }, data: { label: 'D' }, type: 'intersection' },
  { id: 'E', position: { x: 650, y: 450 }, data: { label: 'E' }, type: 'intersection' },
];

const initialEdges: RoadEdge[] = [
  { id: 'eA-B', source: 'A', target: 'B', data: { distance: 5, traffic: 'low', isClosed: false }, type: 'road' },
  { id: 'eA-D', source: 'A', target: 'D', data: { distance: 8, traffic: 'medium', isClosed: false }, type: 'road' },
  { id: 'eB-C', source: 'B', target: 'C', data: { distance: 6, traffic: 'low', isClosed: false }, type: 'road' },
  { id: 'eB-D', source: 'B', target: 'D', data: { distance: 2, traffic: 'low', isClosed: false }, type: 'road' },
  { id: 'eD-E', source: 'D', target: 'E', data: { distance: 4, traffic: 'high', isClosed: false }, type: 'road' },
  { id: 'eC-E', source: 'C', target: 'E', data: { distance: 7, traffic: 'low', isClosed: false }, type: 'road' },
];

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  mode: 'dashboard',
  presentationMode: false,

  setMode: (mode) => set({ mode }),
  togglePresentationMode: () => set((state) => ({ presentationMode: !state.presentationMode })),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as IntersectionNode[],
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges) as RoadEdge[],
    });
  },
  onConnect: (connection) => {
    const newEdge: RoadEdge = {
      id: `e${connection.source}-${connection.target}`,
      source: connection.source,
      target: connection.target,
      type: 'road',
      data: { distance: 10, traffic: 'low', isClosed: false },
    };
    set({
      edges: addEdge(newEdge, get().edges) as RoadEdge[],
    });
  },

  addNode: (node) => set({ nodes: [...get().nodes, node] }),
  updateNode: (id, data) => set({
    nodes: get().nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n)
  }),
  deleteNode: (id) => set({
    nodes: get().nodes.filter(n => n.id !== id),
    edges: get().edges.filter(e => e.source !== id && e.target !== id)
  }),

  addEdge: (edge) => set({ edges: [...get().edges, edge] }),
  updateEdge: (id, data) => set({
    edges: get().edges.map(e => e.id === id && e.data ? { ...e, data: { ...e.data, ...data } } : e)
  }),
  deleteEdge: (id) => set({ edges: get().edges.filter(e => e.id !== id) }),

  resetGraph: () => set({ nodes: initialNodes, edges: initialEdges }),
  
  clearHighlights: () => set({
    edges: get().edges.map(e => {
      if (!e.data) return e;
      const { isShortestPath, ...rest } = e.data;
      return { ...e, data: { ...rest, distance: rest.distance, traffic: rest.traffic, isClosed: rest.isClosed } };
    }),
    nodes: get().nodes.map(n => n) // Will clear node highlights in algorithm store
  })
}));

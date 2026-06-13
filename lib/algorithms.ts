import { Edge, Node } from '@xyflow/react';
import { IntersectionData, RoadData } from '@/store/useGraphStore';
import { AlgorithmStep } from '@/store/useAlgorithmStore';

type GraphNode = Node<IntersectionData>;
type GraphEdge = Edge<RoadData>;

// Basic Priority Queue for Dijkstra
class PriorityQueue<T> {
  private elements: { item: T; priority: number }[] = [];

  enqueue(item: T, priority: number) {
    this.elements.push({ item, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): T | undefined {
    return this.elements.shift()?.item;
  }

  isEmpty(): boolean {
    return this.elements.length === 0;
  }
}

// Helper to get weight based on traffic
const getWeight = (edge: GraphEdge) => {
  if (edge.data?.isClosed) return Infinity;
  const base = edge.data?.distance || 1;
  const traffic = edge.data?.traffic || 'low';
  if (traffic === 'medium') return base * 1.5;
  if (traffic === 'high') return base * 3;
  return base;
};

// Immediate execution of Dijkstra to just get the shortest path (for Navigation Panel)
export function getShortestPath(nodes: GraphNode[], edges: GraphEdge[], start: string, end: string) {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const pq = new PriorityQueue<string>();
  
  nodes.forEach(n => {
    distances[n.id] = Infinity;
    previous[n.id] = null;
  });
  distances[start] = 0;
  pq.enqueue(start, 0);

  let visited = 0;

  while (!pq.isEmpty()) {
    const current = pq.dequeue()!;
    visited++;

    if (current === end) break;

    const neighbors = edges.filter(e => e.source === current || e.target === current);

    for (const edge of neighbors) {
      const neighbor = edge.source === current ? edge.target : edge.source;
      const weight = getWeight(edge);
      if (weight === Infinity) continue; // Closed road

      const alt = distances[current] + weight;
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = current;
        pq.enqueue(neighbor, alt);
      }
    }
  }

  const path: string[] = [];
  let curr: string | null = end;
  if (distances[end] !== Infinity) {
    while (curr) {
      path.unshift(curr);
      curr = previous[curr];
    }
  }

  return { path, distance: distances[end], visited };
}

// Generator for Dijkstra Visualization
export function* generateDijkstraSteps(nodes: GraphNode[], edges: GraphEdge[], start: string, end: string): Generator<AlgorithmStep> {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const pq = new PriorityQueue<string>();
  const visited: string[] = [];
  const queueState: string[] = [];
  const highlightedEdges: string[] = [];

  nodes.forEach(n => {
    distances[n.id] = Infinity;
    previous[n.id] = null;
  });
  distances[start] = 0;
  pq.enqueue(start, 0);
  queueState.push(`${start}(0)`);

  yield {
    currentNode: null, visitedNodes: [...visited], highlightedEdges: [], queueOrStack: [...queueState],
    distances: { ...distances }, description: "Initialized distances. Starting node set to 0."
  };

  while (!pq.isEmpty()) {
    const current = pq.dequeue()!;
    queueState.shift();
    
    yield {
      currentNode: current, visitedNodes: [...visited], highlightedEdges: [...highlightedEdges], queueOrStack: [...queueState],
      distances: { ...distances }, description: `Processing node ${current}.`
    };

    if (current === end) {
      visited.push(current);
      yield {
        currentNode: current, visitedNodes: [...visited], highlightedEdges: [...highlightedEdges], queueOrStack: [...queueState],
        distances: { ...distances }, description: `Reached destination ${end}. Stopping.`
      };
      break;
    }

    if (visited.includes(current)) continue;
    visited.push(current);

    const neighbors = edges.filter(e => e.source === current || e.target === current);

    for (const edge of neighbors) {
      const neighbor = edge.source === current ? edge.target : edge.source;
      const weight = getWeight(edge);
      
      if (weight === Infinity || visited.includes(neighbor)) continue;

      highlightedEdges.push(edge.id);
      
      yield {
        currentNode: current, visitedNodes: [...visited], highlightedEdges: [...highlightedEdges], queueOrStack: [...queueState],
        distances: { ...distances }, description: `Checking edge to ${neighbor} (weight ${weight}).`
      };

      const alt = distances[current] + weight;
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = current;
        pq.enqueue(neighbor, alt);
        queueState.push(`${neighbor}(${alt})`);
        
        yield {
          currentNode: current, visitedNodes: [...visited], highlightedEdges: [...highlightedEdges], queueOrStack: [...queueState],
          distances: { ...distances }, description: `Updated shortest distance to ${neighbor}: ${alt}. Added to PQ.`
        };
      }
      highlightedEdges.pop();
    }
  }

  // Backtrack to highlight shortest path
  let curr: string | null = end;
  const pathEdges: string[] = [];
  if (distances[end] !== Infinity) {
    while (curr && previous[curr]) {
      const prev: string = previous[curr] as string;
      const edge = edges.find(e => (e.source === curr && e.target === prev) || (e.source === prev && e.target === curr));
      if (edge) pathEdges.push(edge.id);
      curr = prev;
    }
  }

  yield {
    currentNode: null, visitedNodes: [...visited], highlightedEdges: pathEdges, queueOrStack: [],
    distances: { ...distances }, description: "Algorithm complete. Shortest path highlighted."
  };
}

export function* generateBFSSteps(nodes: GraphNode[], edges: GraphEdge[], start: string): Generator<AlgorithmStep> {
  const queue: string[] = [start];
  const visited: string[] = [start];
  const highlightedEdges: string[] = [];
  
  yield {
    currentNode: null, visitedNodes: [], highlightedEdges: [], queueOrStack: [...queue],
    distances: {}, description: "Start BFS. Added source node to queue."
  };

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    yield {
      currentNode: current, visitedNodes: [...visited], highlightedEdges: [...highlightedEdges], queueOrStack: [...queue],
      distances: {}, description: `Dequeued ${current}.`
    };

    const neighbors = edges
      .filter(e => e.source === current || e.target === current)
      .map(e => ({ node: e.source === current ? e.target : e.source, edgeId: e.id }));

    for (const { node, edgeId } of neighbors) {
      if (!visited.includes(node)) {
        visited.push(node);
        queue.push(node);
        highlightedEdges.push(edgeId);
        
        yield {
          currentNode: current, visitedNodes: [...visited], highlightedEdges: [...highlightedEdges], queueOrStack: [...queue],
          distances: {}, description: `Visited ${node}. Enqueued.`
        };
      }
    }
  }
  
  yield {
    currentNode: null, visitedNodes: [...visited], highlightedEdges: [...highlightedEdges], queueOrStack: [],
    distances: {}, description: "BFS traversal complete."
  };
}

export function* generateDFSSteps(nodes: GraphNode[], edges: GraphEdge[], start: string): Generator<AlgorithmStep> {
  const stack: string[] = [start];
  const visited: string[] = [];
  const highlightedEdges: string[] = [];
  
  yield {
    currentNode: null, visitedNodes: [], highlightedEdges: [], queueOrStack: [...stack],
    distances: {}, description: "Start DFS. Added source node to stack."
  };

  while (stack.length > 0) {
    const current = stack.pop()!;
    
    if (!visited.includes(current)) {
      visited.push(current);
      
      yield {
        currentNode: current, visitedNodes: [...visited], highlightedEdges: [...highlightedEdges], queueOrStack: [...stack],
        distances: {}, description: `Popped and visited ${current}.`
      };

      const neighbors = edges
        .filter(e => e.source === current || e.target === current)
        .map(e => ({ node: e.source === current ? e.target : e.source, edgeId: e.id }));

      for (const { node, edgeId } of neighbors) {
        if (!visited.includes(node)) {
          stack.push(node);
          highlightedEdges.push(edgeId); // Visual only, not fully accurate for backtracking tree
          yield {
            currentNode: current, visitedNodes: [...visited], highlightedEdges: [...highlightedEdges], queueOrStack: [...stack],
            distances: {}, description: `Pushed neighbor ${node} to stack.`
          };
        }
      }
    }
  }
  
  yield {
    currentNode: null, visitedNodes: [...visited], highlightedEdges: [...highlightedEdges], queueOrStack: [],
    distances: {}, description: "DFS traversal complete."
  };
}

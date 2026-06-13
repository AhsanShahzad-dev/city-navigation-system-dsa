import { create } from 'zustand';

export type AlgorithmType = 'dijkstra' | 'bfs' | 'dfs' | 'all-paths' | null;

export interface AlgorithmStep {
  currentNode: string | null;
  visitedNodes: string[];
  highlightedEdges: string[];
  queueOrStack: string[];
  distances: Record<string, number>;
  description: string;
}

interface AlgorithmState {
  activeAlgorithm: AlgorithmType;
  steps: AlgorithmStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: number; // 0.5, 1, 2, 4
  
  // Controls
  setActiveAlgorithm: (algo: AlgorithmType) => void;
  setSteps: (steps: AlgorithmStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (index: number) => void;
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
  resetAlgorithm: () => void;
}

export const useAlgorithmStore = create<AlgorithmState>((set, get) => ({
  activeAlgorithm: null,
  steps: [],
  currentStepIndex: 0,
  isPlaying: false,
  playbackSpeed: 1,

  setActiveAlgorithm: (algo) => set({ activeAlgorithm: algo, steps: [], currentStepIndex: 0, isPlaying: false }),
  
  setSteps: (steps) => set({ steps, currentStepIndex: 0 }),
  
  nextStep: () => {
    const { currentStepIndex, steps, isPlaying } = get();
    if (currentStepIndex < steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else if (isPlaying) {
      set({ isPlaying: false });
    }
  },
  
  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1, isPlaying: false });
    }
  },
  
  setStep: (index) => {
    const { steps } = get();
    if (index >= 0 && index < steps.length) {
      set({ currentStepIndex: index });
    }
  },
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  setSpeed: (speed) => set({ playbackSpeed: speed }),
  
  resetAlgorithm: () => set({ activeAlgorithm: null, steps: [], currentStepIndex: 0, isPlaying: false })
}));

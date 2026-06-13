import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useGraphStore } from "@/store/useGraphStore";
import { useAlgorithmStore, AlgorithmType } from "@/store/useAlgorithmStore";
import { generateDijkstraSteps, generateBFSSteps, generateDFSSteps } from "@/lib/algorithms";
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";

const ALGORITHMS = [
  { id: 'dijkstra', name: 'Dijkstra Algorithm', desc: 'Finds the shortest path between nodes.' },
  { id: 'bfs', name: 'Breadth-First Search', desc: 'Explores level by level. Good for unweighted graphs.' },
  { id: 'dfs', name: 'Depth-First Search', desc: 'Explores as far as possible before backtracking.' },
] as const;

export function AlgorithmsPanel() {
  const { nodes, edges, clearHighlights } = useGraphStore();
  const { 
    activeAlgorithm, setActiveAlgorithm, setSteps, 
    steps, currentStepIndex, isPlaying, togglePlay, 
    nextStep, prevStep, setSpeed, playbackSpeed, resetAlgorithm
  } = useAlgorithmStore();
  
  const [source, setSource] = useState("");
  const [dest, setDest] = useState("");
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleStart = (algoId: AlgorithmType) => {
    if (!source) return;
    if (algoId === 'dijkstra' && !dest) return;
    
    clearHighlights();
    setActiveAlgorithm(algoId);
    
    let generator;
    if (algoId === 'dijkstra') generator = generateDijkstraSteps(nodes, edges, source, dest);
    else if (algoId === 'bfs') generator = generateBFSSteps(nodes, edges, source);
    else if (algoId === 'dfs') generator = generateDFSSteps(nodes, edges, source);
    
    if (generator) {
      const allSteps = [];
      for (const step of generator) {
        allSteps.push(step);
      }
      setSteps(allSteps);
    }
  };

  const handleReset = () => {
    resetAlgorithm();
    clearHighlights();
    setSource("");
    setDest("");
  };

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        nextStep();
      }, 1000 / playbackSpeed);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, playbackSpeed, nextStep]);

  const currentStep = steps[currentStepIndex];

  return (
    <div className="space-y-4 pb-10">
      <Card>
        <CardHeader>
          <CardTitle>Algorithm Visualizer</CardTitle>
          <CardDescription>Step-by-step graph algorithms.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Source Node</Label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={source} onChange={e => setSource(e.target.value)} disabled={isPlaying || steps.length > 0}
            >
              <option value="">Select source</option>
              {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Destination (For Dijkstra)</Label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={dest} onChange={e => setDest(e.target.value)} disabled={isPlaying || steps.length > 0}
            >
              <option value="">Select dest</option>
              {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
            </select>
          </div>

          {!activeAlgorithm ? (
            <div className="space-y-2 pt-2">
              <Label>Select Algorithm to Start</Label>
              {ALGORITHMS.map(algo => (
                <button
                  key={algo.id}
                  onClick={() => handleStart(algo.id as AlgorithmType)}
                  disabled={!source || (algo.id === 'dijkstra' && !dest)}
                  className="w-full text-left p-3 rounded-md border bg-card hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-semibold text-sm">{algo.name}</div>
                  <div className="text-xs text-muted-foreground">{algo.desc}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary capitalize">{activeAlgorithm}</span>
                <span className="text-xs text-muted-foreground">Step {currentStepIndex + 1} / {steps.length}</span>
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="icon" onClick={prevStep} disabled={currentStepIndex === 0}>
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button variant="default" size="icon" onClick={togglePlay}>
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="icon" onClick={nextStep} disabled={currentStepIndex === steps.length - 1}>
                  <SkipForward className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Playback Speed</Label>
                <div className="flex gap-2">
                  {[0.5, 1, 2, 4].map(s => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`flex-1 py-1 rounded text-xs font-medium border ${playbackSpeed === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {currentStep && (
        <Card className="border-blue-500/50 shadow-blue-500/10">
          <CardHeader>
            <CardTitle className="text-sm">Current State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-muted p-3 rounded-lg text-sm italic border-l-4 border-blue-500">
              {currentStep.description}
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Queue / Stack</Label>
              <div className="flex flex-wrap gap-1">
                {currentStep.queueOrStack.map((item, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-orange-300/20 text-orange-700 dark:text-orange-300 text-xs border border-orange-500/30">
                    {item}
                  </span>
                ))}
                {currentStep.queueOrStack.length === 0 && <span className="text-xs text-muted-foreground">Empty</span>}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Visited Nodes</Label>
              <div className="flex flex-wrap gap-1">
                {currentStep.visitedNodes.map((item, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs border border-blue-500/30">
                    {item}
                  </span>
                ))}
                {currentStep.visitedNodes.length === 0 && <span className="text-xs text-muted-foreground">None</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useGraphStore } from "@/store/useGraphStore";

export function GraphBuilderPanel() {
  const { nodes, edges, addNode, deleteNode, addEdge, deleteEdge } = useGraphStore();
  const [newNodeName, setNewNodeName] = useState("");
  const [sourceNode, setSourceNode] = useState("");
  const [destNode, setDestNode] = useState("");
  const [distance, setDistance] = useState("10");

  const handleAddNode = () => {
    if (!newNodeName.trim()) return;
    const id = newNodeName.trim().toUpperCase();
    if (nodes.find(n => n.id === id)) return; // prevent duplicates

    addNode({
      id,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: id },
      type: 'intersection'
    });
    setNewNodeName("");
  };

  const handleAddEdge = () => {
    if (!sourceNode || !destNode || sourceNode === destNode) return;
    const dist = parseInt(distance);
    if (isNaN(dist) || dist <= 0) return;

    const id = `e${sourceNode}-${destNode}`;
    if (edges.find(e => e.id === id)) return;

    addEdge({
      id,
      source: sourceNode,
      target: destNode,
      type: 'road',
      data: { distance: dist, traffic: 'low', isClosed: false }
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Intersection</CardTitle>
          <CardDescription>Create a new city node.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name (e.g., F)</Label>
            <Input 
              value={newNodeName} 
              onChange={e => setNewNodeName(e.target.value)} 
              placeholder="Intersection Name"
            />
          </div>
          <Button onClick={handleAddNode} className="w-full">Add Node</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Road</CardTitle>
          <CardDescription>Connect two intersections.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Source</Label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={sourceNode} onChange={e => setSourceNode(e.target.value)}
            >
              <option value="">Select source</option>
              {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Destination</Label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={destNode} onChange={e => setDestNode(e.target.value)}
            >
              <option value="">Select dest</option>
              {nodes.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Distance (m)</Label>
            <Input 
              type="number"
              value={distance} 
              onChange={e => setDistance(e.target.value)} 
            />
          </div>
          <Button onClick={handleAddEdge} className="w-full">Add Road</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Graph Elements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-40 overflow-y-auto hidden-scrollbar">
          {nodes.map(n => (
            <div key={n.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
              <span>Node: {n.id}</span>
              <Button variant="destructive" size="sm" onClick={() => deleteNode(n.id)}>Del</Button>
            </div>
          ))}
          {edges.map(e => (
            <div key={e.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded-md mt-2">
              <span>Edge: {e.source} &rarr; {e.target}</span>
              <Button variant="destructive" size="sm" onClick={() => deleteEdge(e.id)}>Del</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

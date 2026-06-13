# Smart City Navigation & Traffic Management System

A production-grade Data Structures and Algorithms (DSA) visualizer built to demonstrate advanced graph theory concepts within the context of a modern, Google Maps-inspired smart city dashboard. 

This application allows users to build dynamic city road networks, simulate real-time traffic conditions, and visualize graph traversal algorithms (BFS, DFS, Dijkstra) with interactive, step-by-step playback.

## ✨ Features

- **Interactive City Map**: A fully draggable, zoomable, and panning map canvas powered by React Flow.
- **Dynamic Node Interactions**: 
  - Click and drag intersections.
  - Right-click context menus for instant algorithm execution and node management.
  - Advanced selection states with connected road highlighting.
- **Algorithm Visualization HUD**: Step-by-step execution playback for:
  - **Dijkstra's Algorithm** (Shortest Path)
  - **Breadth-First Search (BFS)**
  - **Depth-First Search (DFS)**
- **Traffic Simulation**: Roads feature animated SVG particles representing traffic flow, and edges dynamically adjust their visual styling based on traffic density (Low, Medium, High) and road closures.
- **Graph Analytics**: Real-time dashboard panel displaying graph metrics such as total nodes, connectivity status, road density, and degree distribution.
- **Premium UI/UX**: Built with Framer Motion, Tailwind CSS, and Shadcn UI to deliver a seamless, glassmorphism-styled dark/light mode experience.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **Graph Visualization**: [@xyflow/react](https://reactflow.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) installed.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd city-navigation-system-dsa
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to explore the dashboard.

## 🧠 Project Architecture

### Algorithms (`lib/algorithms.ts`)
Algorithms are implemented using JavaScript **Generator Functions**. This allows the graph traversal to yield its state at every significant step (e.g., node visits, queue updates, distance calculations). The UI then consumes these yielded steps to drive the playback HUD, allowing users to pause, play, step forward, or step backward through complex traversals.

### State Management (`store/`)
- `useGraphStore.ts`: Manages the React Flow nodes and edges, preserving the physical map state.
- `useAlgorithmStore.ts`: Handles the playback state, currently active algorithm, and the array of yielded steps to drive the HUD.

### UI Layout (`components/`)
- `map/CityMap.tsx`: The core React Flow canvas combining custom nodes, edges, and map overlays.
- `map/IntersectionNode.tsx`: Custom React Flow nodes representing city intersections.
- `map/RoadEdge.tsx`: Custom SVG-based edges representing roads, complete with traffic particle animations and dynamic styling.

## 📜 License
This project is for educational and presentation purposes.

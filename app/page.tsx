"use client"

import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { CityMap } from "@/components/map/CityMap";
import { useGraphStore } from "@/store/useGraphStore";
import { GraphBuilderPanel } from "@/components/panels/GraphBuilderPanel";
import { NavigationPanel } from "@/components/panels/NavigationPanel";
import { TrafficControlPanel } from "@/components/panels/TrafficControlPanel";
import { AlgorithmsPanel } from "@/components/panels/AlgorithmsPanel";
import { AnalyticsPanel } from "@/components/panels/AnalyticsPanel";
import { AnimatePresence, motion } from "framer-motion";
import { DashboardPanel } from "@/components/panels/DashboardPanel";

export default function Home() {
  const mode = useGraphStore((state) => state.mode);
  const presentationMode = useGraphStore((state) => state.presentationMode);

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-background">
      <AnimatePresence>
        {!presentationMode && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex-shrink-0 z-20"
          >
            <Sidebar />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col relative h-full w-full">
        <AnimatePresence>
          {!presentationMode && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-0 left-0 right-0 z-20 pointer-events-none"
            >
              <div className="p-4 pointer-events-auto">
                <Navbar />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute inset-0 z-0">
          <CityMap />
        </div>

        <AnimatePresence mode="wait">
          {!presentationMode && (
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-24 left-4 z-10 w-80 max-h-[calc(100vh-8rem)] overflow-y-auto hidden-scrollbar"
            >
              {mode === 'dashboard' && <DashboardPanel />}
              {mode === 'build' && <GraphBuilderPanel />}
              {mode === 'navigation' && <NavigationPanel />}
              {mode === 'traffic' && <TrafficControlPanel />}
              {mode === 'algorithms' && <AlgorithmsPanel />}
              {mode === 'analytics' && <AnalyticsPanel />}
            </motion.div>
          )}
        </AnimatePresence>
        
        {presentationMode && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
            {/* Minimal controls for presentation mode */}
            <div className="glass px-6 py-3 rounded-full flex gap-4 items-center">
               <span className="font-semibold">Presentation Mode Active</span>
               <button 
                  onClick={() => useGraphStore.getState().togglePresentationMode()}
                  className="px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-sm hover:opacity-90"
               >
                 Exit
               </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

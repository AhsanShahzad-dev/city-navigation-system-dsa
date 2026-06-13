import { LayoutDashboard, Map, Route, Network, Activity, BarChart3 } from "lucide-react";
import { useGraphStore, AppMode } from "@/store/useGraphStore";
import { cn } from "@/lib/utils";

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'navigation', label: 'Navigation', icon: Map },
  { id: 'build', label: 'Graph Builder', icon: Network },
  { id: 'algorithms', label: 'Algorithms', icon: Route },
  { id: 'traffic', label: 'Traffic Control', icon: Activity },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
] as const;

export function Sidebar() {
  const { mode, setMode } = useGraphStore();

  return (
    <div className="w-64 h-full border-r bg-card/50 backdrop-blur-xl flex flex-col z-50">
      <div className="p-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
          SmartCity
        </h2>
        <p className="text-sm text-muted-foreground font-medium">Navigation System</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = mode === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setMode(item.id as AppMode)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-6 text-xs text-muted-foreground/60 text-center">
        DSA Final Project
      </div>
    </div>
  );
}

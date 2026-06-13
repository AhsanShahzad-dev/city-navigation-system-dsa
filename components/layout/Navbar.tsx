import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, MonitorPlay, Search } from "lucide-react";
import { useGraphStore } from "@/store/useGraphStore";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const togglePresentationMode = useGraphStore(state => state.togglePresentationMode);

  return (
    <div className="w-full flex items-center justify-between glass px-6 py-4 rounded-2xl">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search intersections..." 
            className="w-full pl-9 pr-4 py-2 bg-muted/50 rounded-full text-sm border-none focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-full gap-2"
          onClick={togglePresentationMode}
        >
          <MonitorPlay className="w-4 h-4" />
          <span className="hidden sm:inline">Viva Mode</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md cursor-pointer ring-2 ring-background">
          AD
        </div>
      </div>
    </div>
  );
}

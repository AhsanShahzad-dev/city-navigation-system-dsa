'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun, MonitorPlay, Search } from 'lucide-react';
import { useGraphStore } from '@/store/useGraphStore';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { togglePresentationMode, nodes, edges } = useGraphStore();

  return (
    <div className="w-full flex items-center justify-between bg-card/70 dark:bg-card/60 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-lg border border-border/40">
      {/* Search */}
      <div className="relative w-56">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search intersections…"
          className="w-full pl-9 pr-4 py-2 bg-muted/50 rounded-full text-xs border border-border/50 focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-muted-foreground/70"
        />
      </div>

      {/* Centre title */}
      <div className="hidden sm:flex flex-col items-center">
        <span className="font-black text-sm tracking-tight">Smart City Navigation</span>
        <span className="text-[10px] text-muted-foreground">
          {nodes.length} intersections · {edges.length} roads
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full gap-2 text-xs h-8"
          onClick={togglePresentationMode}
        >
          <MonitorPlay className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Viva Mode</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          <Sun  className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </Button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md ring-2 ring-background cursor-pointer select-none">
          AD
        </div>
      </div>
    </div>
  );
}

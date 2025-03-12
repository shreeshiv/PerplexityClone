"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Boxes, Library, Plus, Command, Bot, Search, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchMode } from "@/contexts/search-mode-context";

const routes = [
  {
    label: "Home",
    icon: Home,
    href: "/",
  },
  {
    label: "Discover",
    icon: Compass,
    href: "/discover",
  },
  {
    label: "Spaces",
    icon: Boxes,
    href: "/spaces",
  },
  {
    label: "Library",
    icon: Library,
    href: "/library",
  },
];

interface SearchMode {
  id: string;
  label: string;
  icon: React.ElementType;
}

const searchModes: SearchMode[] = [
  {
    id: "normal",
    label: "Normal Chatbot",
    icon: Bot,
  },
  {
    id: "open",
    label: "Include Open Search",
    icon: Search,
  },
  {
    id: "deep",
    label: "Deep Search / RL",
    icon: Brain,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { activeSearchModes, toggleSearchMode } = useSearchMode();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-zinc-900 text-white">
      <div className="px-3 py-2 flex-1">
        <div className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">
            perplexity
          </h1>
        </div>
        <div className="space-y-1">
          <div className="mb-4">
            <button className="flex items-center w-full p-3 text-sm font-medium rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition">
              <Plus className="h-4 w-4 mr-2" />
              New Thread
              <kbd className="ml-auto text-xs text-zinc-400 font-mono">
                <span className="flex gap-1">
                  <Command className="h-3 w-3" />
                  K
                </span>
              </kbd>
            </button>
          </div>

          <nav className="flex flex-col space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-zinc-800/50 rounded-lg transition",
                  pathname === route.href ? "bg-zinc-800/50" : "text-zinc-400"
                )}
              >
                <route.icon className="h-4 w-4 mr-2" />
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Search Mode Toggles - Now at bottom */}
      <div className="px-3 py-2 border-t border-zinc-800">
        <h2 className="px-4 text-xs font-semibold text-zinc-400 mb-2">SEARCH MODE</h2>
        <div className="space-y-1">
          {searchModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => toggleSearchMode(mode.id)}
              className={cn(
                "flex items-center w-full p-3 text-sm font-medium rounded-lg transition",
                "hover:bg-zinc-800/50",
                activeSearchModes.has(mode.id) 
                  ? "bg-zinc-800/50 text-white" 
                  : "text-zinc-400"
              )}
            >
              <mode.icon className={cn(
                "h-4 w-4 mr-2",
                activeSearchModes.has(mode.id) ? "text-blue-400" : ""
              )} />
              {mode.label}
              <div className={cn(
                "ml-auto w-9 h-5 rounded-full transition-colors",
                activeSearchModes.has(mode.id) ? "bg-blue-600" : "bg-zinc-700"
              )}>
                <div className={cn(
                  "h-4 w-4 rounded-full bg-white transform transition-transform mt-0.5",
                  activeSearchModes.has(mode.id) ? "translate-x-4 ml-0.5" : "translate-x-0.5"
                )} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Boxes, Library, Plus, Command } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function Sidebar() {
  const pathname = usePathname();

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
    </div>
  );
} 
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot } from "lucide-react";
import { dashboardRoutes } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden min-h-screen w-72 border-r bg-card px-4 py-5 lg:block">
        <Link href="/" className="mb-8 flex items-center gap-3 px-2">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">ReceptionAI</p>
            <p className="text-xs text-muted-foreground">Admin CRM</p>
          </div>
        </Link>
        <nav className="space-y-1">
          {dashboardRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                pathname === route.href && "bg-muted text-foreground"
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </nav>
      </aside>

      <nav className="sticky top-0 z-30 border-b bg-card px-3 py-2 lg:hidden">
        <div className="mb-2 flex items-center gap-2 px-1">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">ReceptionAI</p>
            <p className="text-[11px] text-muted-foreground">Admin CRM</p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dashboardRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium text-muted-foreground",
                pathname === route.href && "border-primary bg-primary/10 text-primary"
              )}
            >
              <route.icon className="h-3.5 w-3.5" />
              {route.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

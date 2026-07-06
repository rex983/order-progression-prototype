"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Mail,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Item = {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: number;
};

export function Sidebar({
  activeCount,
  waitingCount,
}: {
  activeCount: number;
  waitingCount: number;
}) {
  const pathname = usePathname();

  const items: Item[] = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/orders",
      label: "Post-STM Queue",
      icon: ClipboardList,
      count: activeCount,
    },
    {
      href: "/orders?filter=waiting",
      label: "Waiting on Customer",
      icon: Mail,
      count: waitingCount,
    },
    { href: "/admin", label: "Admin", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r bg-card/40">
      <div className="flex items-center gap-2 px-4 py-4 border-b">
        <div className="h-9 w-9 rounded-md grid place-items-center font-bold text-white bg-[var(--brand)]">
          BBD
        </div>
        <div className="leading-tight">
          <div className="font-bold text-sm">
            BIG <span className="text-[var(--brand)]">BUILDINGS</span>
          </div>
          <div className="text-[10px] tracking-[0.2em] text-muted-foreground">
            DIRECT
          </div>
        </div>
      </div>
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const [base] = item.href.split("?");
          const active =
            base === "/" ? pathname === "/" : pathname.startsWith(base);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {item.count ? (
                <span className="h-5 min-w-5 px-1.5 inline-flex items-center justify-center text-[10px] rounded-full bg-[var(--brand)] text-white font-semibold">
                  {item.count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t text-[10px] text-muted-foreground">
        Prototype · in-memory state, resets on server restart
      </div>
    </aside>
  );
}

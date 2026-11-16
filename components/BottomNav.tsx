"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, MessageCircle, User } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/messages", label: "Messages", icon: MessageCircle, badgeKey: "messages" as const },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { unreadMessages } = useStore();

  return (
    <nav className="sticky bottom-0 z-20 mt-auto grid grid-cols-4 border-t border-border-subtle bg-surface-100/95 backdrop-blur">
      {tabs.map(({ href, label, icon: Icon, badgeKey }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        const showBadge = badgeKey === "messages" && unreadMessages > 0;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className="relative flex flex-col items-center gap-1 py-2.5 pb-[max(10px,env(safe-area-inset-bottom))]"
          >
            <span className="relative">
              <Icon
                size={24}
                strokeWidth={active ? 2.25 : 1.75}
                className={active ? "text-ink" : "text-ink-muted"}
                aria-hidden
              />
              {showBadge && (
                <span
                  className="absolute -right-2 -top-1 flex min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-4 text-ink-on-brand"
                  aria-hidden
                >
                  {unreadMessages}
                </span>
              )}
            </span>
            <span
              className={cn("text-tab", active ? "text-ink" : "text-ink-muted")}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

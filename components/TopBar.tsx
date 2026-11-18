"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Bell } from "lucide-react";
import { Logo } from "@/components/Logo";
import { TimeAgo } from "@/components/TimeText";
import { useStore } from "@/lib/store";

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  showBell?: boolean;
  backHref?: string;
}

export function TopBar({
  title,
  showBack,
  showBell = true,
  backHref,
}: TopBarProps) {
  const router = useRouter();
  const { notifications, unreadNotifications, markNotificationsRead } = useStore();
  const [open, setOpen] = useState(false);

  const toggle = () => {
    setOpen((o) => {
      const next = !o;
      if (next) markNotificationsRead();
      return next;
    });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border-subtle bg-surface-100/95 px-4 backdrop-blur">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {showBack ? (
          <button
            type="button"
            onClick={() => (backHref ? router.push(backHref) : router.back())}
            aria-label="Go back"
            className="-ml-2 flex size-9 items-center justify-center rounded-full text-ink hover:bg-surface-200"
          >
            <ArrowLeft size={22} aria-hidden />
          </button>
        ) : (
          <Logo />
        )}
        {title && (
          <h1 className="text-heading-2 truncate text-ink">{title}</h1>
        )}
      </div>

      {showBell && (
        <div className="relative">
          <button
            type="button"
            onClick={toggle}
            aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ""}`}
            aria-expanded={open}
            className="relative flex size-9 items-center justify-center rounded-full text-ink hover:bg-surface-200"
          >
            <Bell size={22} aria-hidden />
            {unreadNotifications > 0 && (
              <span
                className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-4 text-ink-on-brand"
                aria-hidden
              >
                {unreadNotifications}
              </span>
            )}
          </button>

          {open && (
            <>
              <button
                aria-hidden
                tabIndex={-1}
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-30 cursor-default"
              />
              <div
                role="menu"
                className="animate-fade-in absolute right-0 top-11 z-40 w-72 overflow-hidden rounded-md border border-border bg-surface-100 shadow-lg"
              >
                <p className="text-label border-b border-border-subtle px-3 py-2 text-ink-muted">
                  Notifications
                </p>
                {notifications.length === 0 ? (
                  <p className="text-body px-3 py-4 text-ink-subtle">
                    Nothing new right now.
                  </p>
                ) : (
                  <ul className="max-h-80 overflow-y-auto">
                    {notifications.map((n) => (
                      <li key={n.id}>
                        <Link
                          href={n.href}
                          onClick={() => setOpen(false)}
                          className="flex flex-col gap-0.5 px-3 py-2.5 hover:bg-surface-200"
                        >
                          <span className="text-body text-ink">{n.text}</span>
                          <span className="text-caption text-ink-subtle">
                            <TimeAgo iso={n.createdAt} />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}

"use client";

import Link from "next/link";
import { ChevronRight, Moon, Sun, HandHeart } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Avatar } from "@/components/Avatar";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { giver, bundles, allItems } = useStore();
  const { theme, setTheme } = useTheme();

  const giveaways = bundles.length;
  const gone = allItems.filter((i) => i.status === "gone").length;
  const active = allItems.filter((i) => i.status !== "gone").length;
  const activeItems = allItems.filter((i) => i.status !== "gone");

  return (
    <>
      <TopBar />
      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
        <div className="flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Avatar src={giver.avatar} name={giver.name} size={64} />
            <div>
              <h1 className="text-heading-1 text-ink">{giver.name}</h1>
              <p className="text-body text-ink-muted">{giver.location}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Stat value={giveaways} label="Bundles" />
            <Stat value={active} label="Active" />
            <Stat value={gone} label="Rehomed" />
          </div>

          {/* Appearance */}
          <section className="flex flex-col gap-2">
            <h2 className="text-heading-3 text-ink">Appearance</h2>
            <div className="flex gap-2 rounded-md border border-border-subtle bg-surface-200 p-1">
              <ThemeOption
                active={theme === "light"}
                onClick={() => setTheme("light")}
                icon={<Sun size={16} aria-hidden />}
                label="Light"
              />
              <ThemeOption
                active={theme === "dark"}
                onClick={() => setTheme("dark")}
                icon={<Moon size={16} aria-hidden />}
                label="Dark"
              />
            </div>
          </section>

          {/* Your give-aways */}
          <section className="flex flex-col gap-2">
            <h2 className="text-heading-3 text-ink">Your give-aways</h2>
            <ul className="overflow-hidden rounded-md border border-border-subtle bg-surface-100">
              {activeItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/listing/${item.id}`}
                    className="flex items-center gap-3 border-b border-border-subtle px-3 py-2.5 last:border-b-0 hover:bg-surface-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.photos[0]}
                      alt={item.name}
                      className="size-10 rounded-md object-cover"
                    />
                    <span className="text-body-medium flex-1 truncate text-ink">
                      {item.name}
                    </span>
                    <ChevronRight size={18} className="text-ink-subtle" aria-hidden />
                  </Link>
                </li>
              ))}
              {activeItems.length === 0 && (
                <li className="text-body px-3 py-4 text-ink-subtle">
                  No active give-aways right now.
                </li>
              )}
            </ul>
          </section>

          <Link href="/post">
            <div className="flex items-center gap-2 rounded-md bg-brand px-4 py-3 text-ink-on-brand">
              <HandHeart size={18} aria-hidden />
              <span className="text-button">Give something away</span>
            </div>
          </Link>
        </div>
      </main>
      <BottomNav />
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-md border border-border-subtle bg-surface-200 py-3">
      <span className="text-heading-1 text-ink">{value}</span>
      <span className="text-caption text-ink-muted">{label}</span>
    </div>
  );
}

function ThemeOption({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "text-label flex flex-1 items-center justify-center gap-1.5 rounded-sm py-2 transition-colors",
        active ? "bg-brand text-ink-on-brand" : "text-ink-muted hover:bg-surface-300/60",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

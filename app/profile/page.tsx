"use client";

import Link from "next/link";
import { HandHeart, Moon, Search as SearchIcon, Sun } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Avatar } from "@/components/Avatar";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { me, bundles, mySentRequests } = useStore();
  const { theme, setTheme } = useTheme();

  const myItems = bundles.filter((b) => b.giverId === me.id).flatMap((b) => b.items);
  const giveaways = myItems.length;
  const rehomed = myItems.filter((i) => i.status === "gone").length;
  const requests = mySentRequests.length;

  return (
    <>
      <TopBar />
      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <Avatar src={me.avatar} name={me.name} size={64} />
            <div>
              <h1 className="text-heading-1 text-ink">{me.name}</h1>
              <p className="text-body text-ink-muted">{me.location}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Stat value={giveaways} label="Give-aways" />
            <Stat value={requests} label="Requests" />
            <Stat value={rehomed} label="Rehomed" />
          </div>

          <section className="flex flex-col gap-2">
            <h2 className="text-heading-3 text-ink">Appearance</h2>
            <div className="flex gap-2 rounded-md border border-border-subtle bg-surface-200 p-1">
              <ThemeOption active={theme === "light"} onClick={() => setTheme("light")} icon={<Sun size={16} aria-hidden />} label="Light" />
              <ThemeOption active={theme === "dark"} onClick={() => setTheme("dark")} icon={<Moon size={16} aria-hidden />} label="Dark" />
            </div>
          </section>

          <div className="flex flex-col gap-2">
            <Link href="/post">
              <div className="flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-ink-on-brand">
                <HandHeart size={18} aria-hidden />
                <span className="text-button">Give something away</span>
              </div>
            </Link>
            <Link href="/search">
              <div className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-ink">
                <SearchIcon size={18} aria-hidden />
                <span className="text-button">Search for items</span>
              </div>
            </Link>
          </div>
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

function ThemeOption({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
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

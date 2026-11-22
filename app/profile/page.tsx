"use client";

import { Moon, Sun } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";
import { Avatar } from "@/components/Avatar";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Scenario } from "@/lib/data/seed";

const SCENARIOS: { key: Scenario; label: string; desc: string }[] = [
  { key: "giver-new", label: "First-time Giver", desc: "John — empty inbox, ready to post" },
  { key: "receiver-new", label: "First-time Receiver", desc: "Sam — empty inbox, ready to search" },
  { key: "giver-queue", label: "Giver with queue", desc: "John — has posts, people interested" },
  { key: "receiver-chat", label: "Receiver chatting", desc: "Sam — accepted request, ready to chat" },
];

export default function ProfilePage() {
  const { me, bundles, mySentRequests, scenario, switchScenario } = useStore();
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
            <div className="min-w-0 flex-1">
              <h1 className="text-heading-1 text-ink">{me.name}</h1>
              <p className="text-body text-ink-muted">{me.location}</p>
            </div>
            <button
              type="button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              className="flex size-9 items-center justify-center rounded-full border border-border-subtle text-ink-muted hover:bg-surface-200"
            >
              {theme === "light" ? <Moon size={18} aria-hidden /> : <Sun size={18} aria-hidden />}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Stat value={giveaways} label="Give-aways" />
            <Stat value={requests} label="Requests" />
            <Stat value={rehomed} label="Rehomed" />
          </div>

          <section className="flex flex-col gap-2">
            <h2 className="text-heading-3 text-ink">Demo scenario</h2>
            <div className="flex flex-col gap-2">
              {SCENARIOS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => switchScenario(s.key)}
                  className={cn(
                    "flex flex-col rounded-lg border px-4 py-3 text-left transition-colors",
                    scenario === s.key
                      ? "border-brand bg-brand-subtle"
                      : "border-border-subtle bg-surface-pure hover:bg-surface-200",
                  )}
                >
                  <span className={cn("text-label", scenario === s.key ? "text-ink" : "text-ink")}>
                    {s.label}
                  </span>
                  <span className="text-caption text-ink-muted">{s.desc}</span>
                </button>
              ))}
            </div>
          </section>
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

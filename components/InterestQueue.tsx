"use client";

import { useRouter } from "next/navigation";
import { Clock, MessageCircle, UserRound } from "lucide-react";
import type { Item } from "@/lib/types";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { TimeAgo } from "@/components/TimeText";
import { useStore, queueOf } from "@/lib/store";

/**
 * The ordered, one-at-a-time interest queue — the heart of the giver
 * experience. Only the current #1 can be accepted or declined; declining
 * promotes the next person. Accept opens a chat and moves toward handoff.
 */
export function InterestQueue({ item }: { item: Item }) {
  const router = useRouter();
  const { acceptTop, declineTop, getThreadByItem } = useStore();
  const queue = queueOf(item);
  const accepted = item.interests.find((i) => i.state === "accepted");

  if (item.status === "gone") {
    return (
      <p className="text-body text-ink-muted rounded-md bg-surface-200 p-3">
        This item has been picked up and marked gone.
      </p>
    );
  }

  if (accepted) {
    const thread = getThreadByItem(item.id);
    return (
      <div className="flex flex-col gap-3 rounded-md border border-border-subtle bg-surface-200 p-3">
        <div className="flex items-center gap-3">
          <Avatar src={accepted.receiver.avatar} name={accepted.receiver.name} />
          <div className="min-w-0 flex-1">
            <p className="text-heading-3 text-ink">{accepted.receiver.name}</p>
            <p className="text-caption text-success">Accepted — coordinate pickup</p>
          </div>
        </div>
        {thread && (
          <Button
            variant="secondary"
            fullWidth
            leftIcon={<MessageCircle size={18} aria-hidden />}
            onClick={() => router.push(`/messages/${thread.id}`)}
          >
            Open chat
          </Button>
        )}
      </div>
    );
  }

  if (queue.length === 0) {
    // First-to-claim variant.
    return (
      <div className="flex flex-col items-center gap-1 rounded-md border border-dashed border-border-strong bg-surface-200 p-5 text-center">
        <UserRound size={22} className="text-ink-muted" aria-hidden />
        <p className="text-body-medium text-ink">Nobody has shown interest yet</p>
        <p className="text-caption text-ink-subtle">
          The first person to claim it will show up here.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {queue.map((interest) => {
        const isActive = interest.state === "active";
        return (
          <li
            key={interest.id}
            className={`rounded-md border p-3 ${
              isActive
                ? "border-brand/40 bg-brand-subtle/40"
                : "border-border-subtle bg-surface-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="relative">
                <Avatar src={interest.receiver.avatar} name={interest.receiver.name} />
                <span className="text-caption absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-ink font-semibold text-surface-100">
                  {interest.position}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-heading-3 text-ink">{interest.receiver.name}</p>
                  <span className="text-caption text-ink-subtle">
                    #{interest.position}
                  </span>
                </div>
                <p className="text-caption text-ink-subtle">
                  {interest.position === 1 ? "First interest" : "Waiting their turn"}{" "}
                  · <TimeAgo iso={interest.createdAt} />
                </p>
                {interest.note && (
                  <p className="text-body text-ink-muted mt-1">
                    &ldquo;{interest.note}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {isActive && item.status !== "accepted" && (
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button fullWidth onClick={() => acceptTop(item.id)}>
                    Accept
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => declineTop(item.id)}
                  >
                    Decline
                  </Button>
                </div>
                <p className="text-caption text-ink-subtle inline-flex items-center gap-1">
                  <Clock size={12} aria-hidden />
                  Respond within 24h or it passes to the next person.
                </p>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

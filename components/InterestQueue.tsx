"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, X } from "lucide-react";
import type { Interest, Item } from "@/lib/types";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Tag } from "@/components/Tag";
import { TimeAgo } from "@/components/TimeText";
import { useStore } from "@/lib/store";
import { remaining } from "@/lib/utils";

/**
 * The ordered, one-at-a-time interest queue (giver's Received view).
 * Only the current #1 can be accepted/declined; accepting opens a chat
 * and wait-lists the rest; declining promotes the next person.
 */
export function InterestQueue({ item }: { item: Item }) {
  const router = useRouter();
  const { acceptTop, declineTop, undoAccept, getThreadByItem } = useStore();
  const [showBanner, setShowBanner] = useState(true);

  const accepted = item.interests.find((i) => i.state === "accepted");
  const queue = item.interests
    .filter((i) => ["active", "waiting", "accepted"].includes(i.state))
    .sort((a, b) => a.position - b.position);

  const openChat = () => {
    const id = getThreadByItem(item.id)?.id;
    if (id) router.push(`/inbox/${id}`);
  };

  return (
    <div className="flex flex-col gap-3">
      {accepted && showBanner && (
        <div className="flex items-start gap-2 rounded-md bg-positive-subtle p-3">
          <div className="min-w-0 flex-1">
            <p className="text-body-medium text-positive">Request accepted</p>
            <p className="text-caption text-ink-muted mt-0.5">
              {accepted.receiver.name} will be notified. Start a chat to arrange pickup.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowBanner(false)}
            aria-label="Dismiss"
            className="text-positive"
          >
            <X size={16} aria-hidden />
          </button>
        </div>
      )}

      <ul className="flex flex-col divide-y divide-border-subtle">
        {queue.map((interest) => (
          <QueueRow
            key={interest.id}
            interest={interest}
            itemAccepted={Boolean(accepted)}
            onAccept={() => acceptTop(item.id)}
            onDecline={() => declineTop(item.id)}
            onUndo={() => undoAccept(item.id)}
            onStartChat={openChat}
          />
        ))}
      </ul>
    </div>
  );
}

function QueueRow({
  interest,
  itemAccepted,
  onAccept,
  onDecline,
  onUndo,
  onStartChat,
}: {
  interest: Interest;
  itemAccepted: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onUndo: () => void;
  onStartChat: () => void;
}) {
  const isActive = interest.state === "active";
  const isAccepted = interest.state === "accepted";
  const rem = interest.expiresAt ? remaining(interest.expiresAt) : "";

  return (
    <li className="flex flex-col gap-2 py-3 first:pt-0">
      <div className="flex items-start gap-3">
        <Avatar src={interest.receiver.avatar} name={interest.receiver.name} size={36} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-body-medium text-ink">{interest.receiver.name}</p>
            <span className="text-caption text-ink-subtle shrink-0">
              {interest.position === 1 && !itemAccepted ? "#1 request" : `#${interest.position}`}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {isAccepted ? (
              <Tag tone="green" icon={<CheckCircle2 size={12} aria-hidden />}>Accepted</Tag>
            ) : itemAccepted ? (
              <Tag tone="gray">Wait-listed</Tag>
            ) : rem ? (
              <Tag tone="amber" icon={<Clock size={11} aria-hidden />}>{rem} remaining</Tag>
            ) : (
              <span className="text-caption text-ink-subtle">
                <TimeAgo iso={interest.createdAt} />
              </span>
            )}
          </div>
          {isActive && interest.note && (
            <p className="text-body text-ink-muted mt-1.5">&ldquo;{interest.note}&rdquo;</p>
          )}
        </div>
      </div>

      {isActive && (
        <div className="flex gap-2 pl-12">
          <Button fullWidth onClick={onAccept}>Accept</Button>
          <Button variant="secondary" fullWidth onClick={onDecline}>Decline</Button>
        </div>
      )}
      {isAccepted && (
        <div className="flex gap-2 pl-12">
          <Button fullWidth onClick={onStartChat}>Start chat</Button>
          <Button variant="secondary" fullWidth onClick={onUndo}>Undo</Button>
        </div>
      )}
    </li>
  );
}

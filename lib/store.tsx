"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  AppNotification,
  Bundle,
  DraftItem,
  Giver,
  Item,
  MessageType,
  Thread,
} from "@/lib/types";
import {
  bundles as seedBundles,
  giver as seedGiver,
  notifications as seedNotifications,
  threads as seedThreads,
} from "@/lib/data/seed";
import { id as makeId } from "@/lib/utils";

interface StoreState {
  giver: Giver;
  bundles: Bundle[];
  threads: Thread[];
  notifications: AppNotification[];
}

interface StoreValue extends StoreState {
  // selectors
  allItems: Item[];
  getItem: (itemId: string) => Item | undefined;
  getThread: (threadId: string) => Thread | undefined;
  getThreadByItem: (itemId: string) => Thread | undefined;
  unreadNotifications: number;
  unreadMessages: number;
  // actions
  publishBundle: (drafts: DraftItem[], photos: string[]) => Bundle;
  acceptTop: (itemId: string) => string | undefined; // returns threadId
  declineTop: (itemId: string) => void;
  markGone: (itemId: string) => void;
  sendMessage: (threadId: string, text: string, type?: MessageType) => void;
  markNotificationsRead: () => void;
  markThreadRead: (threadId: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);
const STORAGE_KEY = "myvillage.giver.v1";

function queueOf(item: Item) {
  return item.interests
    .filter((i) => i.state === "waiting" || i.state === "active")
    .sort((a, b) => a.position - b.position);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoreState>({
    giver: seedGiver,
    bundles: seedBundles,
    threads: seedThreads,
    notifications: seedNotifications,
  });
  const hydrated = useRef(false);

  // Hydrate from localStorage after mount (keeps SSR markup === first client render).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw) as StoreState);
    } catch {
      /* ignore */
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const allItems = useMemo(
    () => state.bundles.flatMap((b) => b.items),
    [state.bundles],
  );

  const getItem = useCallback(
    (itemId: string) => allItems.find((i) => i.id === itemId),
    [allItems],
  );

  const getThread = useCallback(
    (threadId: string) => state.threads.find((t) => t.id === threadId),
    [state.threads],
  );

  const getThreadByItem = useCallback(
    (itemId: string) => state.threads.find((t) => t.itemId === itemId),
    [state.threads],
  );

  const unreadNotifications = state.notifications.filter((n) => !n.read).length;

  // "Unread messages" = active threads with the latest message from the receiver.
  const unreadMessages = useMemo(
    () =>
      state.threads.filter((t) => {
        const last = t.messages[t.messages.length - 1];
        return last && last.from === "receiver";
      }).length,
    [state.threads],
  );

  const publishBundle = useCallback(
    (drafts: DraftItem[], photos: string[]) => {
      const bundleId = makeId("bundle");
      const createdAt = new Date().toISOString();
      const items: Item[] = drafts.map((d) => ({
        id: makeId("item"),
        bundleId,
        name: d.name,
        category: d.category,
        sizeFit: d.sizeFit,
        condition: d.condition,
        flaws: d.flaws,
        photos: [d.photo],
        status: "available",
        interests: [],
      }));
      const bundle: Bundle = {
        id: bundleId,
        giverId: state.giver.id,
        createdAt,
        photos,
        status: "published",
        items,
      };
      setState((s) => ({ ...s, bundles: [bundle, ...s.bundles] }));
      return bundle;
    },
    [state.giver.id],
  );

  const mutateItem = useCallback(
    (itemId: string, fn: (item: Item) => Item) => {
      setState((s) => ({
        ...s,
        bundles: s.bundles.map((b) => ({
          ...b,
          items: b.items.map((it) => (it.id === itemId ? fn(it) : it)),
        })),
      }));
    },
    [],
  );

  const acceptTop = useCallback(
    (itemId: string) => {
      const item = getItem(itemId);
      if (!item) return undefined;
      const active = item.interests.find((i) => i.state === "active");
      if (!active) return undefined;

      mutateItem(itemId, (it) => ({
        ...it,
        status: "accepted",
        interests: it.interests.map((i) =>
          i.id === active.id ? { ...i, state: "accepted" } : i,
        ),
      }));

      // Open (or reuse) a chat thread with the accepted receiver.
      let thread = getThreadByItem(itemId);
      if (!thread) {
        const threadId = makeId("thread");
        thread = {
          id: threadId,
          itemId,
          participant: active.receiver,
          quickReplies: [
            "Say hi",
            "Share pickup address",
            "Ask for pickup availability",
            "something else",
          ],
          messages: [
            {
              id: makeId("m"),
              from: "system",
              type: "system",
              text: `You accepted ${active.receiver.name}'s request. Say hi and sort out pickup.`,
              createdAt: new Date().toISOString(),
            },
          ],
        };
        setState((s) => ({ ...s, threads: [thread as Thread, ...s.threads] }));
      }
      return thread.id;
    },
    [getItem, getThreadByItem, mutateItem],
  );

  const declineTop = useCallback(
    (itemId: string) => {
      mutateItem(itemId, (it) => {
        const active = it.interests.find((i) => i.state === "active");
        if (!active) return it;
        const declined = it.interests.map((i) =>
          i.id === active.id ? { ...i, state: "declined" as const } : i,
        );
        const remaining = declined
          .filter((i) => i.state === "waiting")
          .sort((a, b) => a.position - b.position);
        // Promote next in line, reindex positions 1..n.
        const promotedIds = new Set(remaining.map((i) => i.id));
        let pos = 0;
        const next = declined.map((i) => {
          if (!promotedIds.has(i.id)) return i;
          pos += 1;
          return {
            ...i,
            position: pos,
            state: pos === 1 ? ("active" as const) : ("waiting" as const),
          };
        });
        return {
          ...it,
          interests: next,
          status: remaining.length > 0 ? ("requested" as const) : ("available" as const),
        };
      });
    },
    [mutateItem],
  );

  const markGone = useCallback(
    (itemId: string) => {
      mutateItem(itemId, (it) => ({ ...it, status: "gone" }));
    },
    [mutateItem],
  );

  const sendMessage = useCallback(
    (threadId: string, text: string, type: MessageType = "text") => {
      if (!text.trim()) return;
      setState((s) => ({
        ...s,
        threads: s.threads.map((t) =>
          t.id === threadId
            ? {
                ...t,
                messages: [
                  ...t.messages,
                  {
                    id: makeId("m"),
                    from: "giver",
                    type,
                    text: text.trim(),
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : t,
        ),
      }));
    },
    [],
  );

  const markNotificationsRead = useCallback(() => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const markThreadRead = useCallback((_threadId: string) => {
    // Reserved: in a real backend this would clear a per-thread unread flag.
  }, []);

  const value: StoreValue = {
    ...state,
    allItems,
    getItem,
    getThread,
    getThreadByItem,
    unreadNotifications,
    unreadMessages,
    publishBundle,
    acceptTop,
    declineTop,
    markGone,
    sendMessage,
    markNotificationsRead,
    markThreadRead,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}

export { queueOf };

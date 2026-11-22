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
  Interest,
  Item,
  MessageType,
  Person,
  Poster,
  SearchQuery,
  Thread,
  User,
} from "@/lib/types";
import {
  posters as seedPosters,
  scenarioData,
  type Scenario,
} from "@/lib/data/seed";
import { id as makeId } from "@/lib/utils";

interface StoreState {
  bundles: Bundle[];
  threads: Thread[];
  notifications: AppNotification[];
  search: SearchQuery;
  notificationsEnabled: boolean;
}

/** An item the current user requested, with its poster. */
export interface SentRequest {
  interest: Interest;
  item: Item;
  poster: Poster;
}

interface StoreValue extends StoreState {
  me: User;
  posters: Poster[];
  // selectors
  allItems: Item[];
  getItem: (itemId: string) => Item | undefined;
  getBundleOf: (itemId: string) => Bundle | undefined;
  getPoster: (giverId: string) => Poster | undefined;
  getPosterOf: (itemId: string) => Poster | undefined;
  getThread: (threadId: string) => Thread | undefined;
  getThreadByItem: (itemId: string) => Thread | undefined;
  amIGiver: (thread: Thread) => boolean;
  otherParty: (thread: Thread) => Person;
  browseItems: Item[];
  searchResults: Item[];
  myReceivedItems: Item[];
  myPostedBundles: Bundle[];
  mySentRequests: SentRequest[];
  getMyInterest: (itemId: string) => Interest | undefined;
  myThreads: Thread[];
  unreadNotifications: number;
  unreadMessages: number;
  // search
  setSearch: (q: SearchQuery) => void;
  // giver actions
  publishBundle: (drafts: DraftItem[], photos: string[], pickupAddress: string) => Bundle;
  acceptTop: (itemId: string) => string | undefined;
  declineTop: (itemId: string) => void;
  undoAccept: (itemId: string) => void;
  markGone: (itemId: string) => void;
  // receiver actions
  joinInterest: (itemId: string, note: string) => void;
  withdrawInterest: (itemId: string) => void;
  updateMyNote: (itemId: string, note: string) => void;
  // chat / pickup
  sendMessage: (threadId: string, text: string, type?: MessageType) => void;
  sharePickupAddress: (threadId: string) => void;
  proposePickupTime: (threadId: string, time: string) => void;
  markArranged: (threadId: string) => void;
  markPickupComplete: (threadId: string) => void;
  markNotificationsRead: () => void;
  notificationsEnabled: boolean;
  enableNotifications: () => void;
  scenario: Scenario;
  switchScenario: (s: Scenario) => void;
}

const StoreContext = createContext<StoreValue | null>(null);
const SCENARIO_KEY = "myvillage.scenario";
const storageKey = (s: string) => `myvillage.v4.${s}`;

const EMPTY_SEARCH: SearchQuery = {
  categories: [],
  sizeFit: "",
  location: "",
  gender: "any",
  conditions: [],
};

function queueOf(item: Item) {
  return item.interests
    .filter((i) => i.state === "waiting" || i.state === "active")
    .sort((a, b) => a.position - b.position);
}

function makeDefaultState(scenario: Scenario): StoreState {
  const data = scenarioData(scenario);
  return {
    bundles: data.bundles,
    threads: data.threads,
    notifications: data.notifications,
    search: EMPTY_SEARCH,
    notificationsEnabled: false,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [scenario, setScenario] = useState<Scenario>(() => {
    if (typeof window === "undefined") return "giver-new";
    try { return (window.localStorage.getItem(SCENARIO_KEY) as Scenario) || "giver-new"; } catch { return "giver-new"; }
  });

  const data = scenarioData(scenario);
  const me = data.user;
  const posters = seedPosters;
  const defaultState = makeDefaultState(scenario);

  const [state, setState] = useState<StoreState>(() => {
    if (typeof window === "undefined") return defaultState;
    try {
      const raw = window.localStorage.getItem(storageKey(scenario));
      if (raw) {
        const saved = JSON.parse(raw) as Partial<StoreState>;
        return { ...defaultState, ...saved, search: saved.search ?? EMPTY_SEARCH };
      }
    } catch { /* ignore */ }
    return defaultState;
  });
  const hydrated = useRef(true);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(storageKey(scenario), JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, scenario]);

  const switchScenario = useCallback((s: Scenario) => {
    try { window.localStorage.setItem(SCENARIO_KEY, s); } catch { /* ignore */ }
    try { window.localStorage.removeItem(storageKey(s)); } catch { /* ignore */ }
    setScenario(s);
    setState(makeDefaultState(s));
  }, []);

  const allItems = useMemo(() => state.bundles.flatMap((b) => b.items), [state.bundles]);

  const getItem = useCallback(
    (itemId: string) => allItems.find((i) => i.id === itemId),
    [allItems],
  );
  const getBundleOf = useCallback(
    (itemId: string) => state.bundles.find((b) => b.items.some((i) => i.id === itemId)),
    [state.bundles],
  );
  const getPoster = useCallback(
    (giverId: string) => posters.find((p) => p.id === giverId),
    [posters],
  );
  const getPosterOf = useCallback(
    (itemId: string) => {
      const bundle = getBundleOf(itemId);
      return bundle ? posters.find((p) => p.id === bundle.giverId) : undefined;
    },
    [getBundleOf, posters],
  );
  const getThread = useCallback(
    (threadId: string) => state.threads.find((t) => t.id === threadId),
    [state.threads],
  );
  const getThreadByItem = useCallback(
    (itemId: string) => state.threads.find((t) => t.itemId === itemId),
    [state.threads],
  );

  const amIGiver = useCallback(
    (thread: Thread) => getBundleOf(thread.itemId)?.giverId === me.id,
    [getBundleOf, me.id],
  );
  const otherParty = useCallback(
    (thread: Thread): Person => {
      const item = getItem(thread.itemId);
      const bundle = item && state.bundles.find((b) => b.id === item.bundleId);
      if (bundle?.giverId === me.id) return thread.participant;
      return getPosterOf(thread.itemId) ?? thread.participant;
    },
    [getItem, getPosterOf, state.bundles, me.id],
  );

  // ---- Discovery ----
  const browseItems = useMemo(
    () =>
      state.bundles
        .filter((b) => b.giverId !== me.id)
        .flatMap((b) => b.items)
        .filter((i) => i.status !== "gone"),
    [state.bundles, me.id],
  );

  const searchResults = useMemo(() => {
    const q = state.search;
    const genderMatch = (item: Item) =>
      q.gender === "any" || item.gender === q.gender || item.gender === "neutral" || !item.gender;
    const matched = browseItems.filter((item) => {
      if (q.categories.length && !q.categories.includes(item.category)) return false;
      if (q.sizeFit && !item.sizeFit.toLowerCase().includes(q.sizeFit.toLowerCase().trim()))
        return false;
      if (!genderMatch(item)) return false;
      if (q.conditions.length && !q.conditions.includes(item.condition)) return false;
      return true;
    });
    return matched.sort((a, b) => {
      const pa = getPosterOf(a.id)?.distanceMi ?? 99;
      const pb = getPosterOf(b.id)?.distanceMi ?? 99;
      if (pa !== pb) return pa - pb;
      return (getBundleOf(b.id)?.createdAt ?? "").localeCompare(getBundleOf(a.id)?.createdAt ?? "");
    });
  }, [browseItems, state.search, getPosterOf, getBundleOf]);

  const myPostedBundles = useMemo(
    () => state.bundles.filter((b) => b.giverId === me.id),
    [state.bundles, me.id],
  );

  const myReceivedItems = useMemo(
    () =>
      myPostedBundles
        .flatMap((b) => b.items)
        .filter((i) => i.interests.length > 0),
    [myPostedBundles],
  );

  const mySentRequests = useMemo<SentRequest[]>(() => {
    const out: SentRequest[] = [];
    for (const b of state.bundles) {
      if (b.giverId === me.id) continue;
      for (const item of b.items) {
        const mine = item.interests.find((i) => i.receiver.id === me.id);
        const poster = posters.find((p) => p.id === b.giverId);
        if (mine && poster) out.push({ interest: mine, item, poster });
      }
    }
    return out.sort((a, b) => b.interest.createdAt.localeCompare(a.interest.createdAt));
  }, [state.bundles, posters, me.id]);

  const getMyInterest = useCallback(
    (itemId: string) => getItem(itemId)?.interests.find((i) => i.receiver.id === me.id),
    [getItem, me.id],
  );

  const myThreads = useMemo(
    () =>
      [...state.threads]
        .filter((t) => {
          const bundle = state.bundles.find((b) => b.items.some((i) => i.id === t.itemId));
          if (bundle?.giverId === me.id) return true;
          const item = bundle?.items.find((i) => i.id === t.itemId);
          return item?.interests.some((i) => i.receiver.id === me.id && i.state === "accepted");
        })
        .sort((a, b) => {
          const la = a.messages[a.messages.length - 1]?.createdAt ?? "";
          const lb = b.messages[b.messages.length - 1]?.createdAt ?? "";
          return lb.localeCompare(la);
        }),
    [state.threads, state.bundles, me.id],
  );

  const unreadNotifications = state.notifications.filter((n) => !n.read).length;
  const unreadMessages = useMemo(
    () =>
      myThreads.filter((t) => {
        const last = t.messages[t.messages.length - 1];
        return last && last.from === "them";
      }).length,
    [myThreads],
  );

  // ================= Actions =================
  const setSearch = useCallback((search: SearchQuery) => setState((s) => ({ ...s, search })), []);

  const mutateItem = useCallback((itemId: string, fn: (item: Item) => Item) => {
    setState((s) => ({
      ...s,
      bundles: s.bundles.map((b) => ({
        ...b,
        items: b.items.map((it) => (it.id === itemId ? fn(it) : it)),
      })),
    }));
  }, []);

  const publishBundle = useCallback(
    (drafts: DraftItem[], photos: string[], pickupAddress: string) => {
      const bundleId = makeId("bundle");
      const createdAt = new Date().toISOString();
      const items: Item[] = drafts.map((d) => ({
        id: makeId("item"),
        bundleId,
        name: d.name,
        category: d.category,
        sizeFit: d.sizeFit,
        gender: d.gender ?? "neutral",
        condition: d.condition,
        flaws: d.flaws,
        photos: [d.photo],
        status: "available",
        interests: [],
      }));
      const bundle: Bundle = {
        id: bundleId,
        giverId: me.id,
        createdAt,
        photos,
        status: "published",
        pickupAddress,
        items,
      };
      setState((s) => ({ ...s, bundles: [bundle, ...s.bundles] }));
      return bundle;
    },
    [me.id],
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
          i.id === active.id
            ? { ...i, state: "accepted" }
            : i.state === "waiting"
              ? { ...i, state: "waiting" }
              : i,
        ),
      }));

      let thread = getThreadByItem(itemId);
      if (!thread) {
        const threadId = makeId("thread");
        const bundle = getBundleOf(itemId);
        thread = {
          id: threadId,
          itemId,
          participant: active.receiver,
          pickup: { address: bundle?.pickupAddress, entrance: bundle?.pickupEntrance, status: "none" },
          messages: [
            {
              id: makeId("m"),
              from: "system",
              type: "system",
              text: `You accepted ${active.receiver.name}'s request`,
              createdAt: new Date().toISOString(),
            },
          ],
        };
        setState((s) => ({ ...s, threads: [thread as Thread, ...s.threads] }));
      }
      return thread.id;
    },
    [getItem, getThreadByItem, getBundleOf, mutateItem],
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

  const undoAccept = useCallback(
    (itemId: string) => {
      mutateItem(itemId, (it) => {
        const accepted = it.interests.find((i) => i.state === "accepted");
        if (!accepted) return it;
        return {
          ...it,
          status: "requested",
          interests: it.interests.map((i) =>
            i.id === accepted.id ? { ...i, state: "active" } : i,
          ),
        };
      });
    },
    [mutateItem],
  );

  const markGone = useCallback(
    (itemId: string) => mutateItem(itemId, (it) => ({ ...it, status: "gone" })),
    [mutateItem],
  );

  const joinInterest = useCallback(
    (itemId: string, note: string) => {
      mutateItem(itemId, (it) => {
        if (it.interests.some((i) => i.receiver.id === me.id)) return it;
        const activeQueue = it.interests.filter((i) => i.state === "waiting" || i.state === "active");
        const nextPos = activeQueue.length + 1;
        const mine: Interest = {
          id: makeId("int"),
          itemId,
          receiver: { id: me.id, name: me.name, avatar: me.avatar },
          position: nextPos,
          note: note.trim(),
          createdAt: new Date().toISOString(),
          state: nextPos === 1 ? "active" : "waiting",
        };
        return {
          ...it,
          status: it.status === "available" ? "requested" : it.status,
          interests: [...it.interests, mine],
        };
      });
    },
    [mutateItem, me],
  );

  const withdrawInterest = useCallback(
    (itemId: string) => {
      mutateItem(itemId, (it) => {
        const mine = it.interests.find((i) => i.receiver.id === me.id);
        if (!mine || (mine.state !== "waiting" && mine.state !== "active")) return it;
        const kept = it.interests.filter((i) => i.id !== mine.id);
        const activeQueue = kept
          .filter((i) => i.state === "waiting" || i.state === "active")
          .sort((a, b) => a.position - b.position);
        const activeIds = new Set(activeQueue.map((i) => i.id));
        let pos = 0;
        const next = kept.map((i) => {
          if (!activeIds.has(i.id)) return i;
          pos += 1;
          return { ...i, position: pos, state: pos === 1 ? ("active" as const) : ("waiting" as const) };
        });
        return {
          ...it,
          interests: next,
          status: activeQueue.length > 0 ? ("requested" as const) : ("available" as const),
        };
      });
    },
    [mutateItem, me.id],
  );

  const updateMyNote = useCallback(
    (itemId: string, note: string) => {
      mutateItem(itemId, (it) => ({
        ...it,
        interests: it.interests.map((i) =>
          i.receiver.id === me.id ? { ...i, note: note.trim() } : i,
        ),
      }));
    },
    [mutateItem, me.id],
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
                  { id: makeId("m"), from: "me", type, text: text.trim(), createdAt: new Date().toISOString() },
                ],
              }
            : t,
        ),
      }));
    },
    [],
  );

  const sharePickupAddress = useCallback((threadId: string) => {
    setState((s) => ({
      ...s,
      threads: s.threads.map((t) => {
        if (t.id !== threadId) return t;
        const item = s.bundles.flatMap((b) => b.items).find((i) => i.id === t.itemId);
        const bundle = item && s.bundles.find((b) => b.id === item.bundleId);
        const address = t.pickup?.address || bundle?.pickupAddress || "our address";
        const entrance = t.pickup?.entrance || bundle?.pickupEntrance;
        return {
          ...t,
          pickup: { ...t.pickup, address, entrance, status: "address_shared" },
          messages: [
            ...t.messages,
            { id: makeId("m"), from: "me", type: "pickup" as const, text: address, createdAt: new Date().toISOString() },
          ],
        };
      }),
    }));
  }, []);

  const proposePickupTime = useCallback((threadId: string, time: string) => {
    if (!time.trim()) return;
    setState((s) => ({
      ...s,
      threads: s.threads.map((t) =>
        t.id === threadId
          ? {
              ...t,
              pickup: { ...t.pickup, time: time.trim(), status: "time_proposed" },
              messages: [
                ...t.messages,
                { id: makeId("m"), from: "me", type: "text" as const, text: `Would ${time.trim()} work?`, createdAt: new Date().toISOString() },
              ],
            }
          : t,
      ),
    }));
  }, []);

  const markArranged = useCallback((threadId: string) => {
    setState((s) => ({
      ...s,
      threads: s.threads.map((t) =>
        t.id === threadId
          ? {
              ...t,
              pickup: { ...t.pickup, status: "arranged" },
              messages: [
                ...t.messages,
                { id: makeId("m"), from: "system" as const, type: "system" as const, text: t.pickup?.time ? `Pickup arranged for ${t.pickup.time}.` : "Pickup arranged.", createdAt: new Date().toISOString() },
              ],
            }
          : t,
      ),
    }));
  }, []);

  const markPickupComplete = useCallback((threadId: string) => {
    setState((s) => {
      const thread = s.threads.find((t) => t.id === threadId);
      const bundles = thread
        ? s.bundles.map((b) => ({
            ...b,
            items: b.items.map((it) =>
              it.id === thread.itemId ? { ...it, status: "gone" as const } : it,
            ),
          }))
        : s.bundles;
      return {
        ...s,
        bundles,
        threads: s.threads.map((t) =>
          t.id === threadId
            ? {
                ...t,
                pickup: { ...t.pickup, status: "complete" },
                messages: [
                  ...t.messages,
                  { id: makeId("m"), from: "system" as const, type: "system" as const, text: "This conversation is complete.", createdAt: new Date().toISOString() },
                ],
              }
            : t,
        ),
      };
    });
  }, []);

  const markNotificationsRead = useCallback(() => {
    setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
  }, []);

  const enableNotifications = useCallback(() => {
    setState((s) => ({ ...s, notificationsEnabled: true }));
  }, []);

  const value: StoreValue = {
    ...state,
    me,
    posters,
    allItems,
    getItem,
    getBundleOf,
    getPoster,
    getPosterOf,
    getThread,
    getThreadByItem,
    amIGiver,
    otherParty,
    browseItems,
    searchResults,
    myReceivedItems,
    myPostedBundles,
    mySentRequests,
    getMyInterest,
    myThreads,
    unreadNotifications,
    unreadMessages,
    setSearch,
    publishBundle,
    acceptTop,
    declineTop,
    undoAccept,
    markGone,
    joinInterest,
    withdrawInterest,
    updateMyNote,
    sendMessage,
    sharePickupAddress,
    proposePickupTime,
    markArranged,
    markPickupComplete,
    markNotificationsRead,
    notificationsEnabled: state.notificationsEnabled,
    enableNotifications,
    scenario,
    switchScenario,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}

export { queueOf };

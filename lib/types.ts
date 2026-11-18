// ============================================================
// My Village — core data model (unified single-user)
// One person both gives away and receives. Mirrors the Figma
// mockups: Home, Search, Browse, Item detail, Inbox
// (Requests: Sent/Received + Messages), and the posting flow.
// Status is the single source of truth, shared everywhere.
// ============================================================

export type Category = "clothing" | "shoes" | "toys";

/** Optional gender fit, used by the needs-based search. */
export type Gender = "boy" | "girl" | "neutral";

/** Visible, trusted status that is the single source of truth. */
export type ItemStatus = "available" | "requested" | "accepted" | "gone";

/** Where a receiver sits in an item's ordered FIFO interest queue. */
export type InterestState =
  | "waiting" // in the queue, not yet their turn
  | "active" // current #1 — only this one can be accepted/declined
  | "accepted"
  | "declined"
  | "expired"; // auto-declined after giver inaction

export type MessageType = "text" | "quick" | "system" | "pickup";
/** Relative to the current user viewing the thread. */
export type MessageFrom = "me" | "them" | "system";

/** The current signed-in user. */
export interface User {
  id: string;
  name: string;
  avatar: string;
  location: string;
}

/** Any other person (a requester or a giver). */
export interface Person {
  id?: string;
  name: string;
  avatar: string;
}

/** The poster of a bundle, resolved from its giverId. */
export interface Poster extends Person {
  location: string;
  /** Distance from the current user, in miles. */
  distanceMi: number;
}

export interface Interest {
  id: string;
  itemId: string;
  /** The interested person (receiver). id set when it's the current user. */
  receiver: Person;
  /** 1-based position in the queue. */
  position: number;
  note: string;
  createdAt: string; // ISO
  state: InterestState;
  /** When the giver's window to act runs out (active entries). */
  expiresAt?: string; // ISO
}

export interface Item {
  id: string;
  bundleId: string;
  name: string;
  category: Category;
  sizeFit: string;
  gender?: Gender;
  condition: string;
  flaws: string;
  photos: string[];
  status: ItemStatus;
  /** Ordered interest queue, position ascending. */
  interests: Interest[];
}

export interface Bundle {
  id: string;
  giverId: string;
  createdAt: string; // ISO
  photos: string[];
  status: "draft" | "published";
  /** Set at posting; a public landmark, not a residential address. */
  pickupAddress?: string;
  pickupEntrance?: string;
  items: Item[];
}

export interface Message {
  id: string;
  from: MessageFrom;
  text: string;
  type: MessageType;
  createdAt: string; // ISO
}

/** Lightweight pickup-coordination state attached to a thread. */
export type PickupStatus =
  | "none"
  | "address_shared"
  | "time_proposed"
  | "arranged"
  | "complete";

export interface Pickup {
  address?: string;
  entrance?: string;
  time?: string;
  status: PickupStatus;
}

export interface Thread {
  id: string;
  itemId: string;
  /** The receiver in this conversation (requester of the item). */
  participant: Person;
  messages: Message[];
  pickup?: Pickup;
}

export interface AppNotification {
  id: string;
  text: string;
  href: string;
  createdAt: string; // ISO
  read: boolean;
}

/** A single drafted listing produced by the AI extraction step. */
export interface DraftItem {
  id: string;
  name: string;
  category: Category;
  /** Display label for the category chip (e.g. "Winter-clothes"); falls back to the category. */
  categoryLabel?: string;
  sizeFit: string;
  gender?: Gender;
  condition: string;
  flaws: string;
  photo: string;
  /** Model confidence 0–1; low values trigger the manual-review hint. */
  confidence: number;
  aiGenerated: boolean;
}

/** The needs-based search, drives browse results. */
export interface SearchQuery {
  categories: Category[];
  sizeFit: string;
  location: string;
  gender: Gender | "any";
  conditions: string[];
}

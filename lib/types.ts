// ============================================================
// My Village — core data model (giver side)
// Mirrors the Supabase schema in supabase/schema.sql.
// ============================================================

export type Category = "clothing" | "shoes" | "toys";

/** Visible, trusted status that is the single source of truth. */
export type ItemStatus = "available" | "requested" | "accepted" | "gone";

/** Where a receiver sits in an item's ordered FIFO interest queue. */
export type InterestState =
  | "waiting" // in the queue, not yet their turn
  | "active" // current #1 — only this one can be accepted/declined
  | "accepted"
  | "declined"
  | "expired"; // auto-declined after giver inaction

export type MessageType = "text" | "quick" | "system";
export type MessageFrom = "giver" | "receiver" | "system";

export interface Giver {
  id: string;
  name: string;
  avatar: string;
  location: string;
}

export interface ReceiverRef {
  name: string;
  avatar: string;
}

export interface Interest {
  id: string;
  itemId: string;
  receiver: ReceiverRef;
  /** 1-based position in the queue. */
  position: number;
  note: string;
  createdAt: string; // ISO
  state: InterestState;
}

export interface Item {
  id: string;
  bundleId: string;
  name: string;
  category: Category;
  sizeFit: string;
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
  items: Item[];
}

export interface Message {
  id: string;
  from: MessageFrom;
  text: string;
  type: MessageType;
  createdAt: string; // ISO
}

export interface Thread {
  id: string;
  itemId: string;
  participant: ReceiverRef;
  messages: Message[];
  quickReplies: string[];
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
  sizeFit: string;
  condition: string;
  flaws: string;
  photo: string;
  /** Model confidence 0–1; low values trigger the manual-review hint. */
  confidence: number;
  aiGenerated: boolean;
}

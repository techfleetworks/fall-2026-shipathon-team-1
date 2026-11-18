import type {
  AppNotification,
  Bundle,
  Poster,
  Thread,
  User,
} from "@/lib/types";
import { avatar, itemPhoto } from "@/lib/media";

// Fixed "now" offsets so the seed reads naturally ("Posted 1 hr ago").
const now = Date.now();
const minsAgo = (m: number) => new Date(now - m * 60_000).toISOString();
const hrsAgo = (h: number) => new Date(now - h * 3_600_000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 86_400_000).toISOString();
const inHrs = (h: number) => new Date(now + h * 3_600_000).toISOString();

// ------------------------------------------------------------
// The current user — one person who both gives and receives.
// ------------------------------------------------------------
export const me: User = {
  id: "me",
  name: "John",
  avatar: avatar("John Doe"),
  location: "Sunset",
};

// ------------------------------------------------------------
// Posters — resolved from a bundle's giverId (distance from me).
// "me" is included so my own give-aways resolve too.
// ------------------------------------------------------------
export const posters: Poster[] = [
  { id: "me", name: "John", avatar: me.avatar, location: "Sunset", distanceMi: 0 },
  { id: "annabel", name: "Annabel", avatar: avatar("Annabel Reyes"), location: "Maple Heights", distanceMi: 5.0 },
  { id: "priya", name: "Priya Mehta", avatar: avatar("Priya Mehta"), location: "Elm Park", distanceMi: 2.3 },
  { id: "jason", name: "Jason", avatar: avatar("Jason Cole"), location: "Birchwood", distanceMi: 1.6 },
  { id: "sarah", name: "Sarah M.", avatar: avatar("Sarah Miller"), location: "Oakdale", distanceMi: 1.8 },
  { id: "james", name: "James K.", avatar: avatar("James King"), location: "Cedar Grove", distanceMi: 3.4 },
  { id: "amy", name: "Amy L.", avatar: avatar("Amy Lowe"), location: "Rosewood", distanceMi: 5.0 },
  { id: "deborah", name: "Deborah", avatar: avatar("Deborah King"), location: "Maple Heights", distanceMi: 1.8 },
  { id: "tomas", name: "Tomas", avatar: avatar("Tomas Rivera"), location: "Oakdale", distanceMi: 0.9 },
  { id: "grace", name: "Grace", avatar: avatar("Grace Mensah"), location: "Cedar Grove", distanceMi: 2.6 },
  { id: "liam", name: "Liam", avatar: avatar("Liam O'Brien"), location: "Birchwood", distanceMi: 3.1 },
  { id: "fatima", name: "Fatima", avatar: avatar("Fatima Saleh"), location: "Elm Park", distanceMi: 2.0 },
];

const meRef = { id: me.id, name: me.name, avatar: me.avatar };
const SHOE_FLAW = "Slightly torn sole around the edge..";

// ============================================================
// Bundles
// ============================================================
export const bundles: Bundle[] = [
  // ----- My give-aways (giverId "me") → the Received requests side -----

  // Pending: Ben #1 awaiting my accept/decline (the core queue demo).
  {
    id: "me_toddler",
    giverId: "me",
    createdAt: daysAgo(2),
    pickupAddress: "24 Willow Lane",
    pickupEntrance: "Front entrance",
    photos: [itemPhoto("me-toddler", "clothing")],
    status: "published",
    items: [
      {
        id: "it_me_toddler",
        bundleId: "me_toddler",
        name: "Toddler clothes",
        category: "clothing",
        sizeFit: "2T",
        gender: "neutral",
        condition: "Used like new",
        flaws: "",
        photos: [itemPhoto("me-toddler-a", "clothing"), itemPhoto("me-toddler-b", "clothing")],
        status: "requested",
        interests: [
          {
            id: "int_mt_ben",
            itemId: "it_me_toddler",
            receiver: { name: "Ben", avatar: avatar("Ben Carter") },
            position: 1,
            note: "Hi! Would love these for my toddler who just started daycare. We're in Sunset.",
            createdAt: hrsAgo(16),
            state: "active",
            expiresAt: inHrs(32),
          },
          {
            id: "int_mt_alex",
            itemId: "it_me_toddler",
            receiver: { name: "Alex", avatar: avatar("Alex Rivera") },
            position: 2,
            note: "We just moved here and could really use these.",
            createdAt: hrsAgo(14),
            state: "waiting",
            expiresAt: inHrs(26),
          },
          {
            id: "int_mt_trinity",
            itemId: "it_me_toddler",
            receiver: { name: "Trinity", avatar: avatar("Trinity Shaw") },
            position: 3,
            note: "Is pickup flexible on weekends?",
            createdAt: hrsAgo(10),
            state: "waiting",
            expiresAt: inHrs(22),
          },
        ],
      },
    ],
  },

  // Accepted: I accepted Ben → populates the giver chat + "Request accepted".
  {
    id: "me_shoes",
    giverId: "me",
    createdAt: daysAgo(3),
    pickupAddress: "24 Willow Lane",
    pickupEntrance: "Front entrance",
    photos: [itemPhoto("me-shoes", "shoes")],
    status: "published",
    items: [
      {
        id: "it_me_shoes",
        bundleId: "me_shoes",
        name: "Shoes",
        category: "shoes",
        sizeFit: "Kids US 8",
        gender: "neutral",
        condition: "Gently used",
        flaws: SHOE_FLAW,
        photos: [itemPhoto("me-shoes-a", "shoes"), itemPhoto("me-shoes-b", "shoes")],
        status: "accepted",
        interests: [
          {
            id: "int_ms_ben",
            itemId: "it_me_shoes",
            receiver: { name: "Ben", avatar: avatar("Ben Carter") },
            position: 1,
            note: "These would be perfect for my son — thank you!",
            createdAt: daysAgo(2),
            state: "accepted",
          },
          {
            id: "int_ms_jo",
            itemId: "it_me_shoes",
            receiver: { name: "Jo", avatar: avatar("Jo Park") },
            position: 2,
            note: "",
            createdAt: daysAgo(2),
            state: "waiting",
          },
        ],
      },
    ],
  },

  // Given away: inactive received card (1 given · 2 declined).
  {
    id: "me_boots",
    giverId: "me",
    createdAt: daysAgo(3),
    pickupAddress: "24 Willow Lane",
    photos: [itemPhoto("me-boots", "shoes")],
    status: "published",
    items: [
      {
        id: "it_me_boots",
        bundleId: "me_boots",
        name: "Winter boots",
        category: "shoes",
        sizeFit: "Toddler US 6",
        gender: "neutral",
        condition: "Used like new",
        flaws: "",
        photos: [itemPhoto("me-boots-a", "shoes")],
        status: "gone",
        interests: [
          { id: "int_mb_rae", itemId: "it_me_boots", receiver: { name: "Rae", avatar: avatar("Rae Innes") }, position: 1, note: "", createdAt: daysAgo(3), state: "accepted" },
          { id: "int_mb_sol", itemId: "it_me_boots", receiver: { name: "Sol", avatar: avatar("Sol Vance") }, position: 2, note: "", createdAt: daysAgo(3), state: "declined" },
          { id: "int_mb_nia", itemId: "it_me_boots", receiver: { name: "Nia", avatar: avatar("Nia Bell") }, position: 3, note: "", createdAt: daysAgo(3), state: "declined" },
        ],
      },
    ],
  },

  // ----- Others' give-aways I've requested (my Sent side) -----

  // Accepted → my receiver chat (full pickup demo) + Sent "Accepted".
  {
    id: "annabel_shoes",
    giverId: "annabel",
    createdAt: hrsAgo(1),
    pickupAddress: "24 Willow Lane",
    pickupEntrance: "Front entrance",
    photos: [itemPhoto("annabel-shoes", "shoes")],
    status: "published",
    items: [
      {
        id: "it_annabel_shoes",
        bundleId: "annabel_shoes",
        name: "Shoes",
        category: "shoes",
        sizeFit: "Boy 2-3 yr old",
        gender: "boy",
        condition: "Used like new",
        flaws: SHOE_FLAW,
        photos: [itemPhoto("annabel-shoes-a", "shoes"), itemPhoto("annabel-shoes-b", "shoes")],
        status: "accepted",
        interests: [
          { id: "int_as_me", itemId: "it_annabel_shoes", receiver: meRef, position: 1, note: "", createdAt: hrsAgo(20), state: "accepted" },
        ],
      },
    ],
  },

  // Accepted → messages list entry.
  {
    id: "priya_toys",
    giverId: "priya",
    createdAt: daysAgo(2),
    pickupAddress: "7 Elm Park Road",
    photos: [itemPhoto("priya-toys", "toys")],
    status: "published",
    items: [
      {
        id: "it_priya_toys",
        bundleId: "priya_toys",
        name: "Toys",
        category: "toys",
        sizeFit: "3+ yrs",
        gender: "neutral",
        condition: "Like new",
        flaws: "",
        photos: [itemPhoto("priya-toys-a", "toys")],
        status: "accepted",
        interests: [
          { id: "int_pt_me", itemId: "it_priya_toys", receiver: meRef, position: 1, note: "", createdAt: daysAgo(2), state: "accepted" },
        ],
      },
    ],
  },

  // Accepted → messages list entry.
  {
    id: "jason_clothes",
    giverId: "jason",
    createdAt: daysAgo(1),
    pickupAddress: "5 Birchwood Avenue",
    photos: [itemPhoto("jason-clothes", "clothing")],
    status: "published",
    items: [
      {
        id: "it_jason_clothes",
        bundleId: "jason_clothes",
        name: "Clothes",
        category: "clothing",
        sizeFit: "3-4 yr old",
        gender: "neutral",
        condition: "Good",
        flaws: "",
        photos: [itemPhoto("jason-clothes-a", "clothing")],
        status: "accepted",
        interests: [
          { id: "int_jc_me", itemId: "it_jason_clothes", receiver: meRef, position: 1, note: "", createdAt: daysAgo(1), state: "accepted" },
        ],
      },
    ],
  },

  // Waiting (my request pending the giver) → Sent "Waiting · 1d 4h left".
  {
    id: "sarah_toddler",
    giverId: "sarah",
    createdAt: daysAgo(1),
    pickupAddress: "3 Oakdale Court",
    photos: [itemPhoto("sarah-toddler", "clothing")],
    status: "published",
    items: [
      {
        id: "it_sarah_toddler",
        bundleId: "sarah_toddler",
        name: "Toddler clothes",
        category: "clothing",
        sizeFit: "2T",
        gender: "girl",
        condition: "Used like new",
        flaws: "",
        photos: [itemPhoto("sarah-toddler-a", "clothing")],
        status: "requested",
        interests: [
          { id: "int_st_me", itemId: "it_sarah_toddler", receiver: meRef, position: 1, note: "These would be perfect — thank you!", createdAt: hrsAgo(20), state: "active", expiresAt: inHrs(28) },
        ],
      },
    ],
  },

  // Found a home → Sent "This bundle found a home / Browse similar".
  {
    id: "james_baby",
    giverId: "james",
    createdAt: daysAgo(4),
    photos: [itemPhoto("james-baby", "clothing")],
    status: "published",
    items: [
      {
        id: "it_james_baby",
        bundleId: "james_baby",
        name: "Baby clothes",
        category: "clothing",
        sizeFit: "6-9m",
        gender: "neutral",
        condition: "Gently used",
        flaws: "",
        photos: [itemPhoto("james-baby-a", "clothing")],
        status: "gone",
        interests: [
          { id: "int_jb_me", itemId: "it_james_baby", receiver: meRef, position: 2, note: "", createdAt: daysAgo(4), state: "declined" },
          { id: "int_jb_other", itemId: "it_james_baby", receiver: { name: "Mara", avatar: avatar("Mara Quist") }, position: 1, note: "", createdAt: daysAgo(4), state: "accepted" },
        ],
      },
    ],
  },

  // Timed out → Sent "This request timed out".
  {
    id: "amy_toddler",
    giverId: "amy",
    createdAt: daysAgo(5),
    photos: [itemPhoto("amy-toddler", "clothing")],
    status: "published",
    items: [
      {
        id: "it_amy_toddler",
        bundleId: "amy_toddler",
        name: "Toddler clothes",
        category: "clothing",
        sizeFit: "3T",
        gender: "neutral",
        condition: "Good",
        flaws: "",
        photos: [itemPhoto("amy-toddler-a", "clothing")],
        status: "requested",
        interests: [
          { id: "int_at_me", itemId: "it_amy_toddler", receiver: meRef, position: 1, note: "", createdAt: daysAgo(5), state: "expired" },
          { id: "int_at_other", itemId: "it_amy_toddler", receiver: { name: "Devi", avatar: avatar("Devi Rao") }, position: 1, note: "", createdAt: daysAgo(4), state: "active", expiresAt: inHrs(10) },
        ],
      },
    ],
  },

  // ----- Browse-only catalogue (not yet requested by me) -----

  // First one to claim (empty queue).
  {
    id: "deb_shoes",
    giverId: "deborah",
    createdAt: hrsAgo(1),
    pickupAddress: "8 Maple Heights",
    photos: [itemPhoto("deb-shoes", "shoes")],
    status: "published",
    items: [
      {
        id: "it_deb_shoes",
        bundleId: "deb_shoes",
        name: "Shoes",
        category: "shoes",
        sizeFit: "Boy 2-3 yr old",
        gender: "boy",
        condition: "Used like new",
        flaws: SHOE_FLAW,
        photos: [itemPhoto("deb-shoes-a", "shoes"), itemPhoto("deb-shoes-b", "shoes")],
        status: "available",
        interests: [],
      },
    ],
  },

  // People waiting (join the queue).
  {
    id: "tomas_shoes",
    giverId: "tomas",
    createdAt: hrsAgo(5),
    pickupAddress: "3 Oakdale Court",
    photos: [itemPhoto("tomas-shoes", "shoes")],
    status: "published",
    items: [
      {
        id: "it_tomas_shoes",
        bundleId: "tomas_shoes",
        name: "Shoes",
        category: "shoes",
        sizeFit: "Boy 2-3 yr old",
        gender: "boy",
        condition: "Used like new",
        flaws: SHOE_FLAW,
        photos: [itemPhoto("tomas-shoes-a", "shoes"), itemPhoto("tomas-shoes-b", "shoes")],
        status: "requested",
        interests: [
          { id: "int_ts_ben", itemId: "it_tomas_shoes", receiver: { name: "Ben", avatar: avatar("Ben Carter") }, position: 1, note: "", createdAt: daysAgo(3), state: "active", expiresAt: inHrs(20) },
          { id: "int_ts_alex", itemId: "it_tomas_shoes", receiver: { name: "Alex", avatar: avatar("Alex Rivera") }, position: 2, note: "", createdAt: daysAgo(2), state: "waiting" },
        ],
      },
    ],
  },

  // A little more variety for browse results.
  {
    id: "grace_clothes",
    giverId: "grace",
    createdAt: hrsAgo(8),
    pickupAddress: "40 Cedar Grove",
    photos: [itemPhoto("grace-clothes", "clothing")],
    status: "published",
    items: [
      {
        id: "it_grace_clothes",
        bundleId: "grace_clothes",
        name: "Clothes",
        category: "clothing",
        sizeFit: "2-3 yr old",
        gender: "girl",
        condition: "Gently used",
        flaws: "",
        photos: [itemPhoto("grace-clothes-a", "clothing"), itemPhoto("grace-clothes-b", "clothing")],
        status: "available",
        interests: [],
      },
    ],
  },
  {
    id: "liam_boots",
    giverId: "liam",
    createdAt: daysAgo(1),
    pickupAddress: "5 Birchwood Avenue",
    photos: [itemPhoto("liam-boots", "shoes")],
    status: "published",
    items: [
      {
        id: "it_liam_boots",
        bundleId: "liam_boots",
        name: "Rain boots",
        category: "shoes",
        sizeFit: "Toddler US 7",
        gender: "neutral",
        condition: "Gently used",
        flaws: "",
        photos: [itemPhoto("liam-boots-a", "shoes")],
        status: "available",
        interests: [],
      },
    ],
  },
  {
    id: "fatima_toys",
    giverId: "fatima",
    createdAt: daysAgo(1),
    pickupAddress: "22 Elm Park Road",
    photos: [itemPhoto("fatima-toys", "toys")],
    status: "published",
    items: [
      {
        id: "it_fatima_toys",
        bundleId: "fatima_toys",
        name: "Toys",
        category: "toys",
        sizeFit: "0-3 yrs",
        gender: "neutral",
        condition: "Good",
        flaws: "",
        photos: [itemPhoto("fatima-toys-a", "toys")],
        status: "available",
        interests: [],
      },
    ],
  },
];

// ============================================================
// Threads — every conversation involving me. The other party is
// computed per-thread (giver of the item, unless the item is mine).
// ============================================================
export const threads: Thread[] = [
  // I'm the receiver; Annabel (giver) accepted me and shared the address.
  {
    id: "th_annabel",
    itemId: "it_annabel_shoes",
    participant: meRef,
    pickup: { address: "24 Willow Lane", entrance: "Front entrance", status: "address_shared" },
    messages: [
      { id: "ta1", from: "system", type: "system", text: "Annabel accepted your request", createdAt: hrsAgo(20) },
      { id: "ta2", from: "me", type: "quick", text: "Hi Annabel! Thanks for the shoes.", createdAt: hrsAgo(19) },
      { id: "ta3", from: "them", type: "text", text: "Hi! You're welcome. Let's arrange pickup.", createdAt: hrsAgo(19) },
      { id: "ta4", from: "them", type: "pickup", text: "24 Willow Lane", createdAt: hrsAgo(18) },
    ],
  },
  // I'm the receiver; Priya accepted me.
  {
    id: "th_priya",
    itemId: "it_priya_toys",
    participant: meRef,
    pickup: { address: "7 Elm Park Road", status: "none" },
    messages: [
      { id: "tp1", from: "system", type: "system", text: "Priya accepted your request", createdAt: daysAgo(2) },
      { id: "tp2", from: "them", type: "text", text: "When would you like to pick it up?", createdAt: hrsAgo(30) },
    ],
  },
  // I'm the receiver; Jason accepted me.
  {
    id: "th_jason",
    itemId: "it_jason_clothes",
    participant: meRef,
    pickup: { address: "5 Birchwood Avenue", status: "none" },
    messages: [
      { id: "tj1", from: "system", type: "system", text: "Jason accepted your request", createdAt: daysAgo(1) },
      { id: "tj2", from: "them", type: "text", text: "Thanks for the clothes bundle! My daughter outgrew them.", createdAt: hrsAgo(26) },
    ],
  },
  // I'm the giver; I accepted Ben on my Shoes.
  {
    id: "th_ben",
    itemId: "it_me_shoes",
    participant: { name: "Ben", avatar: avatar("Ben Carter") },
    pickup: { address: "24 Willow Lane", entrance: "Front entrance", status: "none" },
    messages: [
      { id: "tb1", from: "system", type: "system", text: "You accepted Ben's request", createdAt: daysAgo(2) },
      { id: "tb2", from: "them", type: "text", text: "Hi! Thank you so much. When can I come by?", createdAt: daysAgo(1) },
    ],
  },
];

// ============================================================
// Notifications
// ============================================================
export const notifications: AppNotification[] = [
  { id: "n1", text: "Annabel accepted your request for the Shoes.", href: "/inbox/th_annabel", createdAt: hrsAgo(20), read: false },
  { id: "n2", text: "Ben is first in line for your Toddler clothes.", href: "/inbox", createdAt: hrsAgo(16), read: false },
  { id: "n3", text: "You're first in line for Sarah M.'s Toddler clothes.", href: "/item/it_sarah_toddler", createdAt: hrsAgo(20), read: true },
];

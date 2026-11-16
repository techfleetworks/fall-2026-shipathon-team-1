import type {
  AppNotification,
  Bundle,
  Giver,
  Thread,
} from "@/lib/types";
import { avatar, itemPhoto } from "@/lib/media";

// Fixed "now" offsets so the seed reads naturally ("Posted 1 hr ago").
const now = Date.now();
const minsAgo = (m: number) => new Date(now - m * 60_000).toISOString();
const hrsAgo = (h: number) => new Date(now - h * 3_600_000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 86_400_000).toISOString();

export const giver: Giver = {
  id: "giver_amara",
  name: "Amara",
  avatar: avatar("Amara Okafor"),
  location: "Rosewood, 1.2 km away",
};

export const bundles: Bundle[] = [
  {
    id: "bundle_1",
    giverId: giver.id,
    createdAt: hrsAgo(1),
    photos: [itemPhoto("pile-1", "clothing"), itemPhoto("pile-1b", "toys")],
    status: "published",
    items: [
      {
        id: "item_coat",
        bundleId: "bundle_1",
        name: "Toddler winter coat",
        category: "clothing",
        sizeFit: "Boy 2-3 yr old",
        condition: "Used like new",
        flaws: "",
        photos: [itemPhoto("coat-a", "clothing"), itemPhoto("coat-b", "clothing")],
        status: "requested",
        interests: [
          {
            id: "int_coat_1",
            itemId: "item_coat",
            receiver: { name: "Ben", avatar: avatar("Ben Carter") },
            position: 1,
            note: "This would be perfect for my son this winter — thank you!",
            createdAt: minsAgo(44),
            state: "active",
          },
          {
            id: "int_coat_2",
            itemId: "item_coat",
            receiver: { name: "Alex", avatar: avatar("Alex Rivera") },
            position: 2,
            note: "We just moved here and could really use this.",
            createdAt: minsAgo(30),
            state: "waiting",
          },
          {
            id: "int_coat_3",
            itemId: "item_coat",
            receiver: { name: "Trinity", avatar: avatar("Trinity Shaw") },
            position: 3,
            note: "Is pickup flexible on weekends?",
            createdAt: minsAgo(12),
            state: "waiting",
          },
        ],
      },
      {
        id: "item_sneakers",
        bundleId: "bundle_1",
        name: "Canvas sneakers",
        category: "shoes",
        sizeFit: "Kids US 8",
        condition: "Gently used",
        flaws: "Slightly torn sole around the edge",
        photos: [itemPhoto("sneak-a", "shoes")],
        status: "available",
        interests: [],
      },
      {
        id: "item_puzzle",
        bundleId: "bundle_1",
        name: "Wooden puzzle set",
        category: "toys",
        sizeFit: "3+ yrs",
        condition: "Like new",
        flaws: "",
        photos: [itemPhoto("puzzle-a", "toys")],
        status: "requested",
        interests: [
          {
            id: "int_puzzle_1",
            itemId: "item_puzzle",
            receiver: { name: "Maya", avatar: avatar("Maya Lin") },
            position: 1,
            note: "My daughter loves puzzles, this looks lovely.",
            createdAt: minsAgo(20),
            state: "active",
          },
          {
            id: "int_puzzle_2",
            itemId: "item_puzzle",
            receiver: { name: "Sam", avatar: avatar("Sam Patel") },
            position: 2,
            note: "",
            createdAt: minsAgo(8),
            state: "waiting",
          },
        ],
      },
    ],
  },
  {
    id: "bundle_2",
    giverId: giver.id,
    createdAt: daysAgo(2),
    photos: [itemPhoto("pile-2", "clothing")],
    status: "published",
    items: [
      {
        id: "item_onesies",
        bundleId: "bundle_2",
        name: "Striped cotton onesies (set of 3)",
        category: "clothing",
        sizeFit: "0-3 months",
        condition: "Used like new",
        flaws: "",
        photos: [itemPhoto("onesie-a", "clothing")],
        status: "accepted",
        interests: [
          {
            id: "int_onesie_1",
            itemId: "item_onesies",
            receiver: { name: "Priya", avatar: avatar("Priya Nair") },
            position: 1,
            note: "Expecting in March — these are adorable, thank you!",
            createdAt: daysAgo(2),
            state: "accepted",
          },
        ],
      },
      {
        id: "item_gym",
        bundleId: "bundle_2",
        name: "Soft activity play gym",
        category: "toys",
        sizeFit: "0-12 months",
        condition: "Good",
        flaws: "One hanging toy attachment missing",
        photos: [itemPhoto("gym-a", "toys")],
        status: "gone",
        interests: [
          {
            id: "int_gym_1",
            itemId: "item_gym",
            receiver: { name: "Jordan", avatar: avatar("Jordan Blake") },
            position: 1,
            note: "",
            createdAt: daysAgo(2),
            state: "accepted",
          },
        ],
      },
    ],
  },
];

export const threads: Thread[] = [
  {
    id: "thread_onesies",
    itemId: "item_onesies",
    participant: { name: "Priya", avatar: avatar("Priya Nair") },
    quickReplies: [
      "Say hi",
      "Share pickup address",
      "Ask for pickup availability",
      "something else",
    ],
    messages: [
      {
        id: "m1",
        from: "system",
        type: "system",
        text: "You accepted Priya's request. Say hi and sort out pickup.",
        createdAt: daysAgo(2),
      },
      {
        id: "m2",
        from: "receiver",
        type: "text",
        text: "Hi! Thank you so much for accepting. When would be a good time to pick these up?",
        createdAt: daysAgo(2),
      },
    ],
  },
];

export const notifications: AppNotification[] = [
  {
    id: "notif_1",
    text: "Your post has got new interests.",
    href: "/messages",
    createdAt: minsAgo(12),
    read: false,
  },
  {
    id: "notif_2",
    text: "Ben is first in line for your Toddler winter coat.",
    href: "/listing/item_coat",
    createdAt: minsAgo(44),
    read: false,
  },
  {
    id: "notif_3",
    text: "Priya is waiting to hear about pickup.",
    href: "/messages/thread_onesies",
    createdAt: hrsAgo(20),
    read: true,
  },
];

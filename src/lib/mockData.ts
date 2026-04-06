export interface NearbyPerson {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  distance: string;
  socials: { platform: string; handle: string }[];
  crossedAt?: string;
  angle: number; // position on radar in degrees
  radius: number; // 0-1, distance from center on radar
}

export const nearbyPeople: NearbyPerson[] = [
  {
    id: "1",
    name: "Maya Chen",
    bio: "UX designer & plant mom 🌿 Always looking for coffee shop recs",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    distance: "5m away",
    socials: [
      { platform: "Instagram", handle: "@mayachen.design" },
      { platform: "Twitter", handle: "@mayachenux" },
    ],
    angle: 45,
    radius: 0.35,
  },
  {
    id: "2",
    name: "Jordan Lee",
    bio: "Music producer 🎵 Dog dad. Probably wearing headphones.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    distance: "12m away",
    socials: [
      { platform: "Instagram", handle: "@jordanbeats" },
      { platform: "SoundCloud", handle: "jordanlee" },
    ],
    angle: 160,
    radius: 0.55,
  },
  {
    id: "3",
    name: "Aisha Patel",
    bio: "Startup founder 🚀 Bookworm. Ask me about AI ethics.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    distance: "8m away",
    socials: [
      { platform: "LinkedIn", handle: "aisha-patel" },
      { platform: "Twitter", handle: "@aisha_builds" },
    ],
    angle: 250,
    radius: 0.42,
  },
  {
    id: "4",
    name: "Marcus Rivera",
    bio: "Photographer & street art enthusiast 📸 NYC based",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    distance: "20m away",
    socials: [
      { platform: "Instagram", handle: "@marcusrivera.photo" },
    ],
    angle: 310,
    radius: 0.75,
  },
  {
    id: "5",
    name: "Lena Kim",
    bio: "Yoga teacher & wellness coach 🧘‍♀️ Spreading good vibes",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    distance: "15m away",
    socials: [
      { platform: "Instagram", handle: "@lenawellness" },
    ],
    angle: 95,
    radius: 0.6,
  },
];

export const crossedPaths: (NearbyPerson & { crossedAt: string })[] = [
  { ...nearbyPeople[2], crossedAt: "Today, 2:34 PM" },
  { ...nearbyPeople[0], crossedAt: "Today, 11:15 AM" },
  { ...nearbyPeople[3], crossedAt: "Yesterday, 6:20 PM" },
  { ...nearbyPeople[4], crossedAt: "Yesterday, 9:45 AM" },
  { ...nearbyPeople[1], crossedAt: "2 days ago" },
];

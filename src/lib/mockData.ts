export interface NearbyPerson {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  distance: string;
  distanceMiles: number;
  socials: { platform: string; handle: string }[];
  crossedAt?: string;
  angle: number;
  radius: number;
  isVerified?: boolean;
  userId?: string;
}

export const nearbyPeople: NearbyPerson[] = [];

export const crossedPaths: (NearbyPerson & { crossedAt: string })[] = [];

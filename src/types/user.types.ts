import type { BaseEntity } from "./base.types";

export interface UserProfile extends BaseEntity {
  displayName: string;
  email: string;
  avatar?: string | null;
  rating?: number | null;
  wins: number;
  losses: number;
  preferredHand: "left" | "right";
  clubId?: string | null;
}

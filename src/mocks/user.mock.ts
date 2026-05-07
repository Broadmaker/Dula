import type { UserProfile } from "@/types/user.types";

export const MOCK_USER: UserProfile = {
  uuid: "user-123",
  server_id: "sid-user-123",
  sync_status: "synced",
  sync_error: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  displayName: "Mark Dev",
  email: "mark@example.com",
  avatar: "https://ui-avatars.com/api/?name=Mark+Dev&background=4CAF50&color=fff",
  rating: 3.5,
  wins: 12,
  losses: 8,
  preferredHand: "right",
  clubId: "club-abc",
};

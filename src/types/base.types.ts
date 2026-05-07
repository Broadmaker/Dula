export type SyncStatus = "pending" | "synced" | "error";

export interface BaseEntity {
  uuid: string; // Client-side UUID
  server_id: string | null; // Firestore document ID (after sync)
  sync_status: SyncStatus;
  sync_error: string | null;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

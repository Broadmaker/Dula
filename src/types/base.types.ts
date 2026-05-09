// src/types/base.types.ts

export type SyncStatus = "pending" | "synced" | "deleted" | "error";
// "pending"  → written locally, not yet synced
// "synced"   → confirmed by backend
// "deleted"  → soft-deleted, awaiting backend confirmation
// "error"    → exceeded max retries; requires user attention

export interface BaseEntity {
  id: number;              // SQLite local PK — AUTOINCREMENT, never sent to backend
  uuid: string;            // Client-generated UUID v4 — used for all cross-device references
  server_id: string | null; // Firestore document ID — null until first sync
  sync_status: SyncStatus;
  sync_error: string | null; // Human-readable reason when sync_status = "error"
  created_at: string;      // ISO 8601 — set on insert, never mutated
  updated_at: string;      // ISO 8601 — updated on every write
}
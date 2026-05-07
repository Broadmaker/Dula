/**
 * project.config.ts — DULA
 *
 * AI reads this file FIRST at the start of every session (GLOBAL.md §18, Step 1).
 * Values here drive conditional logic in the build workflow.
 * Do not add business logic — constants only.
 */

const projectConfig = {

  // ─── Identity ────────────────────────────────────────────────────────────
  app_name:    'DULA',
  bundle_id:   'com.dula.app',           // update when confirmed
  version:     '0.1.0',
  phase:       1,                         // current active phase (1–5)

  // ─── Backend ─────────────────────────────────────────────────────────────
  backend:     'firebase' as const,       // 'firebase' | 'supabase' — see DECISIONS.md D-001
  database:    'firestore' as const,      // Firestore for cloud, expo-sqlite for local

  // ─── Feature Flags ───────────────────────────────────────────────────────
  enable_sync:          false,            // Phase 2+ — no Firestore in Phase 1
  enable_auth:          false,            // Phase 2+
  enable_live_sync:     false,            // Phase 3+ — toggle in Settings (disabled label Phase 1-2)
  enable_cloud_history: false,            // Phase 2+
  enable_spectator:     false,            // Phase 3+
  enable_analytics:     false,            // Phase 3+
  enable_tournaments:   false,            // Phase 4+
  enable_notifications: false,            // Phase 2+

  // ─── Share Card ──────────────────────────────────────────────────────────
  share_card_formats:   ['feed', 'story'] as const,  // 'feed' = 1:1, 'story' = 9:16
  share_card_branding:  true,             // show DULA watermark on share card

  // ─── Navigation ──────────────────────────────────────────────────────────
  nav_library:  'react-navigation' as const,  // NEVER Expo Router
  nav_structure: {
    auth_stack:      ['Login', 'Register', 'ForgotPassword'],
    home_stack:      ['Dashboard', 'MatchSetup'],
    match_stack:     ['LiveScoring', 'MatchSummary'],
    history_stack:   ['MatchHistory', 'MatchDetail'],
    analytics_stack: ['AnalyticsDashboard'],
    profile_stack:   ['Profile', 'Settings'],
    tabs:            ['HomeTab', 'MatchTab', 'HistoryTab', 'AnalyticsTab', 'ProfileTab'],
  },

  // ─── Styling ─────────────────────────────────────────────────────────────
  styling:      'nativewind' as const,    // NativeWind v4 only — see DECISIONS.md D-003
  default_theme: 'dark' as const,         // 'light' | 'dark'

  // ─── Local DB ────────────────────────────────────────────────────────────
  local_db:     'expo-sqlite' as const,   // Next API — see DECISIONS.md D-002
  sqlite_wal:   true,                     // WAL mode always on

  // ─── Sync ────────────────────────────────────────────────────────────────
  sync_max_retries:   5,
  sync_backoff_base:  1000,               // ms — exponential: min(base * 2^retry, max)
  sync_backoff_max:   30000,              // ms

  // ─── Scoring Rules ───────────────────────────────────────────────────────
  score_limits:           [11, 15, 21] as const,
  default_score_limit:    11,
  max_timeouts_per_team:  2,
  side_switch_threshold:  6,              // game 3 only — switch when leader hits this

  // ─── Build ───────────────────────────────────────────────────────────────
  expo_sdk:     '51',
  eas_profiles: ['development', 'preview', 'production'] as const,

} as const

export default projectConfig
export type ProjectConfig = typeof projectConfig
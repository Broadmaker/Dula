# GLOBAL.md — Mobile Architecture Profile v3.3

> **Scope:** Applies to ALL projects. Never duplicate these rules in PROJECT.md.
> **AI Target:** Gemini CLI
> **Companion files:** PROJECT.md · SUMMARY.md · LESSONS.md

---

## 📖 Table of Contents

1. [4-File Profile System](#1-4-file-profile-system)
2. [AI Operating Principles](#2-ai-operating-principles)
3. [Task Management Protocol](#3-task-management-protocol)
4. [Tech Stack](#4-tech-stack)
5. [Universal Project Structure](#5-universal-project-structure)
6. [Layer Rules & Responsibilities](#6-layer-rules--responsibilities)
7. [Navigation Architecture](#7-navigation-architecture)
8. [State Management](#8-state-management)
9. [TanStack Query Conventions](#9-tanstack-query-conventions)
10. [Data Model — Required Fields](#10-data-model--required-fields)
11. [Backend Adapter Interface](#11-backend-adapter-interface)
12. [Backend Rules — Supabase & Firebase](#12-backend-rules--supabase--firebase)
13. [Sync Strategy](#13-sync-strategy)
14. [Error Handling](#14-error-handling)
15. [Security](#15-security)
16. [Performance](#16-performance)
17. [Naming Conventions](#17-naming-conventions)
18. [Enforced Build Workflow](#18-enforced-build-workflow)
19. [Verification Standard](#19-verification-standard)
20. [Quality Checklist](#20-quality-checklist)
21. [Anti-Patterns](#21-anti-patterns)
22. [Gemini CLI Shortcuts](#22-gemini-cli-shortcuts)

---

## 1. 4-File Profile System

| File            | Scope                                               | Read order at session start | Reset per project? |
| --------------- | --------------------------------------------------- | --------------------------- | ------------------ |
| `LESSONS.md`    | AI corrections — accumulates across ALL projects    | **1st — always**            | ❌ Never           |
| `CONTEXT.md`    | Hand-off note — where we stopped, next action       | **2nd — always**            | ✅ Per project     |
| `DECISIONS.md`  | Architectural decisions with full rationale         | 3rd                         | ✅ Per project     |
| `SCHEMA.md`     | Living DB map — tables, columns, RLS, relationships | 3rd                         | ✅ Per project     |
| `PROJECT.md`    | App identity, theme, nav map, flags                 | 4th                         | ✅ Per project     |
| `GLOBAL.md`     | Universal rules — stack, architecture, AI behaviour | 5th                         | ❌ Never           |
| `SUMMARY.md`    | Full session log — all files, features, decisions   | Only if more detail needed  | ✅ Per project     |
| `tasks/todo.md` | Active task plan — written before non-trivial work  | During session              | ✅ Per task        |

> ⚠️ **No duplication rule:** If a rule exists in GLOBAL.md, do NOT repeat it in any other file. Reference it by section name instead.
>
> 📌 **Session start read order:** `LESSONS.md` → `CONTEXT.md` → `DECISIONS.md` + `SCHEMA.md` → `PROJECT.md` → `GLOBAL.md`

---

## 2. AI Operating Principles

> These govern **how the AI thinks and behaves** — not what it builds.
> Apply to every task, every session, every project, without exception.

### 2.1 Plan Before Acting

- Enter plan mode for **any non-trivial task** (3+ steps, or any architectural decision)
- Write the full plan to `tasks/todo.md` with checkable items **before touching any code**
- Check in with the user to verify the plan before starting implementation
- If something goes sideways mid-task: **STOP → re-plan → check in** — never keep pushing
- Plan mode applies to verification steps too, not just building

### 2.2 Self-Improvement Loop

- After **any correction from the user**: open `LESSONS.md` and add the pattern immediately
- Write a rule specific enough that future sessions won't repeat the same mistake
- Read `LESSONS.md` at the **start of every session**, before generating anything
- Goal: a measurably dropping mistake rate across sessions — treat every correction as data

### 2.3 Verification Before Done

- Never mark a task complete without proving it works → see [Section 19](#19-verification-standard)
- Ask before presenting: _"Would a senior React Native engineer approve this without changes?"_
- If the answer is no: fix it first, then present

### 2.4 Demand Elegance — Balanced

- For non-trivial changes: pause and ask _"Is there a more elegant solution?"_
- If a fix feels hacky: _"Knowing everything I know now — implement the proper solution"_
- Skip this for simple, obvious one-liners — do not over-engineer trivial tasks
- Challenge your own output before presenting it

### 2.5 Autonomous Bug Fixing

- When given a bug report: **just fix it** — no hand-holding, no clarifying questions first
- Trace to root cause using logs, error messages, and failing renders — then resolve
- ❌ Never apply a temporary patch if a root cause fix is available
- RN-specific: check Metro logs, Hermes errors, and test on both iOS and Android mental models

### 2.6 Subagent Strategy (where supported)

- Use subagents to keep the main context window clean on complex tasks
- Offload research, exploration, and parallel analysis to focused subagents
- One task per subagent — avoid mixing concerns
- For very complex problems: more compute via subagents, not shortcuts in the main thread

### 2.7 Simplicity First

- Make every change **as small and focused as possible**
- Affect the minimum code needed to achieve the goal — no collateral changes
- Simple ≠ sloppy — simple means clean, readable, and intentional
- No laziness: find root causes, no temporary fixes, senior-engineer standards always

---

## 3. Task Management Protocol

> Every non-trivial task follows this sequence. No skipping.

```
1. PLAN     → Write plan to tasks/todo.md with checkable items
2. CHECK IN → Verify plan with user before touching code
3. BUILD    → Implement step by step; mark items ✅ as you go
4. EXPLAIN  → Give a high-level summary at each meaningful step
5. VERIFY   → Run the full verification checklist (Section 19)
6. REVIEW   → Add results/tradeoffs section to tasks/todo.md
7. LEARN    → If any correction was given: update LESSONS.md immediately
8. UPDATE   → Append all new files and decisions to SUMMARY.md
```

**`tasks/todo.md` format:**

```md
## Plan: Add Task Feature

**Goal:** Types → mock → hook → component → screen → DB schema → service

- [ ] Step 1: Define Task type in src/types/task.types.ts
- [ ] Step 2: Create mock data in src/mocks/task.mock.ts
- [ ] Step 3: Build useTaskMock hook
- [ ] Step 4: Build TaskCard component
- [ ] Step 5: Wire TaskListScreen
- [ ] Step 6: Register in HomeStack
- [ ] Step 7: Define SQLite schema
- [ ] Step 8: Build task.api.ts with BackendAdapter interface
- [x] Step 9: (example — already done)

## Review

- What was built: ...
- Decisions made: ...
- Known tradeoffs: ...
- Corrections received: ...
```

---

## 4. Tech Stack

| Layer          | Technology                   | Notes                                            |
| -------------- | ---------------------------- | ------------------------------------------------ |
| Framework      | React Native + Expo SDK 51+  | Managed workflow                                 |
| Language       | TypeScript 5+ (strict mode)  | `noImplicitAny`, `strictNullChecks` on           |
| Styling        | NativeWind v4                | Tailwind classes via `className` — no StyleSheet |
| Local DB       | Expo SQLite (Next API)       | `useSQLiteContext`, `runAsync`, WAL mode         |
| Navigation     | @react-navigation/native v6+ | NativeStack + BottomTabs — NO Expo Router        |
| Async State    | TanStack Query v5            | Server/async state only — see Section 9          |
| Persistence    | AsyncStorage                 | TanStack Query cache persistence only            |
| Validation     | Zod                          | All external inputs and API responses            |
| Secure Storage | expo-secure-store            | Tokens, passwords, sensitive config              |
| UUID           | expo-crypto                  | `Crypto.randomUUID()` — preferred over uuid pkg  |
| Backend A      | Supabase                     | SQL, RLS, Realtime, Auth, Storage                |
| Backend B      | Firebase                     | Firestore, Auth, Storage, offline cache          |

### Path alias setup — required on every project

All code examples use `@/` as the import alias for `src/`. Configure both files below when bootstrapping a project:

```json
// tsconfig.json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

```js
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: { "@": "./src" },
        },
      ],
    ],
  };
};
// Required package: npm install -D babel-plugin-module-resolver
// NOTE: use npm/yarn — NOT npx expo install (this is not an Expo SDK package)
```

> ❌ Never use deep relative paths like `../../../hooks/useTask` — always use `@/hooks/useTask`.

---

## 5. Universal Project Structure

```
src/
├── navigation/
│   ├── RootNavigator.tsx       ← Auth gate; conditionally mounts tabs or stacks
│   ├── types.ts                ← ALL param lists — never defined anywhere else
│   ├── stacks/                 ← One file per stack navigator
│   │   ├── AuthStack.tsx
│   │   ├── HomeStack.tsx
│   │   └── SettingsStack.tsx
│   └── tabs/                   ← One file per bottom tab bar
│       └── MainTabs.tsx
│
├── screens/                    ← One folder per feature/domain
│   └── Task/
│       ├── TaskListScreen.tsx
│       └── TaskDetailScreen.tsx
│
├── components/
│   ├── ui/                     ← Atomic, stateless, reusable primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── OfflineBanner.tsx
│   └── features/               ← Domain components: UI + hook wiring
│       └── TaskCard.tsx
│
├── services/
│   ├── db/                     ← SQLite CRUD only — no API calls here
│   │   └── task.db.ts
│   ├── api/                    ← Backend adapters (Supabase or Firebase)
│   │   ├── supabase.client.ts  ← Singleton — initialized once
│   │   ├── firebase.client.ts  ← Singleton — initialized once
│   │   └── task.api.ts
│   └── sync/                   ← Mutation queue, retry, conflict resolution
│       └── task.sync.ts
│
├── hooks/                      ← Business logic + TanStack Query — no UI
│   ├── useTask.ts
│   └── useTaskMock.ts
│
├── mocks/                      ← Mock data that mirrors real services exactly
│   └── task.mock.ts
│
├── store/                      ← Global UI state only (auth session, theme, toasts)
│   ├── authStore.ts            ← Zustand — see Section 8
│   └── uiStore.ts
│
├── types/                      ← All shared TypeScript types — single source of truth
│   ├── task.types.ts
│   └── supabase.types.ts       ← Generated by Supabase CLI
│
├── utils/                      ← Pure, side-effect-free utility functions
│   ├── logger.ts               ← Central logger — replaces console.log
│   └── formatDate.ts
│
└── constants/                  ← App-wide constants — values from PROJECT.md live here
    └── theme.ts                ← Colors, spacing, typography (copied from PROJECT.md)

tasks/
├── todo.md                     ← Active task plan (AI writes this before building)
project.config.ts               ← AI reads this first every session
PROJECT.md                      ← App-specific config and theme
SUMMARY.md                      ← Living session log
LESSONS.md                      ← Accumulated AI corrections (never reset)
```

---

## 6. Layer Rules & Responsibilities

| Layer                  | Allowed                                                            | Forbidden                                                  |
| ---------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| `navigation/`          | Mount screens, read auth state from store                          | Business logic, DB calls, API calls, UI rendering          |
| `screens/`             | Call hooks, pass data to components, call `navigation`             | Direct DB/API calls, business logic, styling beyond layout |
| `components/ui/`       | Local `useState`/`useRef` for UI state, NativeWind styles          | Hooks with business logic, any service call                |
| `components/features/` | Receive data + callbacks via props, call `useNavigation` if needed | Direct DB/API calls                                        |
| `hooks/`               | TanStack Query, call service adapters, return typed state          | UI rendering, `navigation` calls, direct SDK calls         |
| `services/db/`         | SQLite reads and writes                                            | API calls, navigation, UI                                  |
| `services/api/`        | Backend SDK calls, implement `BackendAdapter<T>`                   | SQLite, UI, navigation                                     |
| `services/sync/`       | Read mutation queue, call API adapter, update SQLite               | UI, navigation                                             |
| `mocks/`               | Return typed mock data with simulated delay                        | Any real service call                                      |
| `store/`               | Global UI state: auth session, theme, toasts                       | Server/async state — that belongs in TanStack Query        |
| `types/`               | TypeScript interfaces, types, enums                                | Logic of any kind                                          |
| `utils/`               | Pure functions with no side effects                                | State, services, navigation                                |
| `constants/`           | Static values, theme tokens                                        | Logic, imports from services                               |

> → **Cross-reference:** The `BackendAdapter<T>` interface that `services/api/` must implement is defined in [Section 11](#11-backend-adapter-interface).

---

## 7. Navigation Architecture

> → **Forbidden:** Expo Router and file-based routing. React Navigation only, always.

### Package installation

```bash
npx expo install @react-navigation/native @react-navigation/native-stack \
  @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context
```

### Folder structure rules

| File / Folder                  | Rule                                                           |
| ------------------------------ | -------------------------------------------------------------- |
| `navigation/types.ts`          | ALL param lists defined here — never inline in navigator files |
| `navigation/RootNavigator.tsx` | Only file that reads auth state and gates routes               |
| `navigation/stacks/`           | One file per stack — `HomeStack.tsx`, `AuthStack.tsx`, etc.    |
| `navigation/tabs/`             | One file per tab bar — `MainTabs.tsx`, etc.                    |

### `navigation/types.ts` — param list pattern

```ts
// src/navigation/types.ts
// Every route in the app is typed here. Add new routes here FIRST, then create the screen.

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type HomeStackParamList = {
  TaskList: undefined;
  TaskDetail: { id: string };
  TaskEdit: { id: string; mode: "create" | "edit" };
};

export type SettingsStackParamList = {
  Settings: undefined;
  Profile: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  SettingsTab: undefined;
};
```

### Stack file pattern

```tsx
// src/navigation/stacks/HomeStack.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "@/navigation/types";
import { TaskListScreen } from "@/screens/Task/TaskListScreen";
import { TaskDetailScreen } from "@/screens/Task/TaskDetailScreen";

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="TaskList" component={TaskListScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
    </Stack.Navigator>
  );
}
```

### Tab file pattern

```tsx
// src/navigation/tabs/MainTabs.tsx
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { MainTabParamList } from "@/navigation/types";
import { HomeStack } from "@/navigation/stacks/HomeStack";
import { SettingsStack } from "@/navigation/stacks/SettingsStack";

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}
```

### RootNavigator pattern

```tsx
// src/navigation/RootNavigator.tsx
import { NavigationContainer } from "@react-navigation/native";
import { useAuthStore } from "@/store/authStore";
import { AuthStack } from "@/navigation/stacks/AuthStack";
import { MainTabs } from "@/navigation/tabs/MainTabs";

export function RootNavigator() {
  const session = useAuthStore((s) => s.session); // ← reads from Zustand store
  return (
    <NavigationContainer>
      {session ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
```

### Typed navigation inside screens/components

```ts
// Always type both hooks — never use untyped versions
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { HomeStackParamList } from "@/navigation/types";

// In a list screen (no route params needed):
const navigation =
  useNavigation<NativeStackNavigationProp<HomeStackParamList, "TaskList">>();

// In a detail screen (needs route params):
const navigation =
  useNavigation<NativeStackNavigationProp<HomeStackParamList, "TaskDetail">>();
const route = useRoute<RouteProp<HomeStackParamList, "TaskDetail">>();
const { id } = route.params; // fully typed
```

### Navigation rules

- ❌ Never use Expo Router or create an `app/` directory
- ❌ Never pass `navigation` as a prop — call `useNavigation()` in the component that needs it
- ❌ Never `navigate()` with untyped string literals
- ❌ Never put business logic, DB, or API calls inside navigator files
- ❌ Never define param lists inline in stack/tab files — always import from `types.ts`
- ✅ Always define the route in `types.ts` before creating the screen file
- ✅ Always gate auth routes in `RootNavigator` based on session state from `authStore`
- ✅ Always unsubscribe from any listeners set up inside `useEffect` in screens

---

## 8. State Management

> Two distinct tools for two distinct purposes. Never mix their responsibilities.

### Decision Table — What Goes Where

| State type          | Tool                            | Example                                     |
| ------------------- | ------------------------------- | ------------------------------------------- |
| Server / async data | **TanStack Query**              | Task list, user profile, synced records     |
| Global UI state     | **Zustand**                     | Auth session, theme preference, toast queue |
| Local UI state      | **useState / useRef**           | Modal open, input focus, animation value    |
| Form state          | **useState** or react-hook-form | Form fields, validation errors              |
| Navigation state    | **React Navigation**            | Current screen, back stack                  |

> ❌ Never put server data (API results, DB rows) into Zustand.
> ❌ Never use TanStack Query for purely local UI state.

### Zustand store pattern

```ts
// src/store/authStore.ts
import { create } from "zustand";

type Session = { userId: string; token: string } | null;

type AuthStore = {
  session: Session;
  setSession: (session: Session) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  clearSession: () => set({ session: null }),
}));
```

### UI store pattern

```ts
// src/store/uiStore.ts
import { create } from "zustand";

type Toast = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

type UIStore = {
  toasts: Toast[];
  isOffline: boolean;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  setOffline: (offline: boolean) => void;
};

export const useUIStore = create<UIStore>((set) => ({
  toasts: [],
  isOffline: false,
  addToast: (toast) =>
    set((s) => ({
      toasts: [...s.toasts, { ...toast, id: Date.now().toString() }],
    })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  setOffline: (isOffline) => set({ isOffline }),
}));
```

### Zustand rules

- One store per concern — `authStore`, `uiStore`, never one giant store
- Stores are read in components via selectors: `useAuthStore((s) => s.session)`
- `RootNavigator` reads `authStore` to gate auth vs app routes
- `OfflineBanner` reads `uiStore.isOffline` — set by NetInfo listener in `App.tsx`

> → **Cross-reference:** TanStack Query conventions for server state are in [Section 9](#9-tanstack-query-conventions).

---

## 9. TanStack Query Conventions

> TanStack Query v5 handles ALL server-side and async data. These conventions must be followed consistently across every feature.

### Query key factory pattern

```ts
// src/hooks/useTask.ts
// Always define query keys as a factory on the hook file — never inline magic strings

export const taskKeys = {
  all: () => ["tasks"] as const,
  list: (filters?: TaskFilters) => ["tasks", "list", filters ?? {}] as const,
  detail: (id: string) => ["tasks", "detail", id] as const,
};
```

### useQuery pattern

```ts
import { useQuery } from "@tanstack/react-query";
import { taskKeys } from "./useTask";
import { taskApi } from "@/services/api/task.api";

export function useTaskList(filters?: TaskFilters) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: async () => {
      const result = await taskApi.getAll("tasks");
      if (result.error) throw new Error(result.error.message); // TQ catches and exposes via isError
      return result.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes — adjust per feature in PROJECT.md if needed
    gcTime: 1000 * 60 * 10, // 10 minutes cache retention
  });
}

// Usage in screen:
// const { data, isLoading, isError, error } = useTaskList();
```

### useMutation pattern

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskKeys } from "./useTask";
import { taskApi } from "@/services/api/task.api";

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskInput) => taskApi.insert("tasks", data),
    onSuccess: () => {
      // Invalidate the list so it refetches fresh data
      queryClient.invalidateQueries({ queryKey: taskKeys.list() });
    },
    onError: (error) => {
      // Log via central logger — never console.log
      logger.error("useCreateTask failed", error);
    },
  });
}

// Usage in screen:
// const { mutate: createTask, isPending } = useCreateTask();
```

### Infinite query (pagination) pattern

```ts
import { useInfiniteQuery } from "@tanstack/react-query";

export function useTaskListInfinite(pageSize = 20) {
  return useInfiniteQuery({
    queryKey: taskKeys.list({ paginated: true }),
    queryFn: ({ pageParam = 0 }) =>
      taskApi.getPage("tasks", pageParam, pageSize),
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === pageSize ? pages.length : undefined,
    initialPageParam: 0,
  });
}
```

### Mock hook pattern

```ts
// src/hooks/useTaskMock.ts
// Must return the exact same shape as the real hook — swap with zero UI changes

export function useTaskListMock() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Task[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(MOCK_TASKS); // from src/mocks/task.mock.ts
      setIsLoading(false);
    }, 800); // simulate realistic network delay
    return () => clearTimeout(timer);
  }, []);

  return {
    data,
    isLoading,
    isError: false,
    error: null,
    isEmpty: !isLoading && data.length === 0,
  };
}
```

### TanStack Query rules

- ❌ Never use `useEffect` + `useState` for data fetching — use `useQuery`
- ❌ Never store server data in Zustand — TanStack Query is the cache
- ✅ Always define a `queryKey` factory on the hook file — no magic strings inline
- ✅ `staleTime` default is **2 minutes** — override per feature only when justified
- ✅ Always invalidate related queries in `onSuccess` of mutations
- ✅ Mock hooks must return the same shape as real hooks — shape parity is mandatory

### App.tsx bootstrap — QueryClient + QueryClientProvider

```tsx
// App.tsx — the single place QueryClient is instantiated
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";
import { RootNavigator } from "@/navigation/RootNavigator";

// Automatically refetch when network reconnects
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes global default
      gcTime: 1000 * 60 * 10, // 10 minutes cache retention
      retry: 2, // retry failed queries twice
      refetchOnWindowFocus: false, // mobile apps don't have window focus
    },
    mutations: {
      retry: 0, // mutations do not auto-retry — handled by sync queue instead
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}
```

> ✅ `onlineManager` + `NetInfo` wires TanStack Query's online state to the device network state automatically — queries pause when offline and refetch on reconnect.
> ✅ Individual hooks override `staleTime` only when their data has different freshness requirements than the global default.

> → **Cross-reference:** The `BackendAdapter<T>` that `queryFn` calls into is defined in [Section 11](#11-backend-adapter-interface).

---

## 10. Data Model — Required Fields

> Every SQLite table and TypeScript entity type must include ALL of these fields.

| Field         | TS Type                                         | SQLite Type                         | Notes                                                         |
| ------------- | ----------------------------------------------- | ----------------------------------- | ------------------------------------------------------------- |
| `id`          | `number`                                        | `INTEGER PRIMARY KEY AUTOINCREMENT` | Local only — never sent to backend                            |
| `uuid`        | `string`                                        | `TEXT NOT NULL UNIQUE`              | UUID v4, generated on client at insert                        |
| `server_id`   | `string \| null`                                | `TEXT`                              | Remote ID from backend; `NULL` until first sync               |
| `sync_status` | `'pending' \| 'synced' \| 'deleted' \| 'error'` | `TEXT NOT NULL DEFAULT 'pending'`   | Drives the sync queue                                         |
| `sync_error`  | `string \| null`                                | `TEXT`                              | Failure reason when `sync_status = 'error'`; `NULL` otherwise |
| `created_at`  | `string`                                        | `TEXT NOT NULL`                     | ISO 8601 — set on insert, never mutated                       |
| `updated_at`  | `string`                                        | `TEXT NOT NULL`                     | ISO 8601 — updated on every write                             |

### TypeScript entity base type

```ts
// src/types/base.types.ts

export type SyncStatus = "pending" | "synced" | "deleted" | "error";
// 'pending' → written locally, not yet synced
// 'synced'  → confirmed by backend
// 'deleted' → soft-deleted, awaiting backend confirmation
// 'error'   → exceeded max_retries; requires user attention or manual retry

export type BaseEntity = {
  id: number;
  uuid: string;
  server_id: string | null;
  sync_status: SyncStatus;
  sync_error: string | null; // human-readable reason when sync_status = 'error'
  created_at: string;
  updated_at: string;
};

// Extend for every feature entity:
export type Task = BaseEntity & {
  title: string;
  description: string | null;
  is_complete: boolean;
};
```

### SQLite schema pattern

```ts
// src/services/db/task.db.ts
const CREATE_TASKS_TABLE = `
  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid        TEXT    NOT NULL UNIQUE,
    server_id   TEXT,
    sync_status TEXT    NOT NULL DEFAULT 'pending',
    sync_error  TEXT,
    created_at  TEXT    NOT NULL,
    updated_at  TEXT    NOT NULL,
    title       TEXT    NOT NULL,
    description TEXT,
    is_complete INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS idx_tasks_uuid        ON tasks (uuid);
  CREATE INDEX IF NOT EXISTS idx_tasks_server_id   ON tasks (server_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_sync_status ON tasks (sync_status);
`;
```

### Data model rules

- ❌ Never hard-delete rows — set `sync_status = 'deleted'` (soft delete only)
- ❌ Never send local `id` to the backend — use `uuid` or `server_id` for remote operations
- ❌ Never use Unix epoch timestamps — always ISO 8601 strings
- ✅ Generate UUID using `Crypto.randomUUID()` from `expo-crypto`
- ✅ `server_id` is nullable until synced — all hooks and services must tolerate `null`
- ✅ Always index `uuid`, `server_id`, and `sync_status`

---

## 11. Backend Adapter Interface

> Both Supabase and Firebase services implement this contract.
> Hooks call this interface — never the concrete SDK directly.
> Switching backends = changing the adapter only. Zero hook or UI changes.

```ts
// src/services/api/adapter.types.ts

export type AppError = {
  code: string;
  message: string;
};

export type Result<T> =
  | { data: T; error: null }
  | { data: null; error: AppError };

export type Unsubscribe = () => void;

export interface BackendAdapter<T> {
  getAll(resource: string): Promise<Result<T[]>>;
  getById(resource: string, id: string): Promise<Result<T>>;
  insert(resource: string, data: Partial<T>): Promise<Result<T>>;
  update(resource: string, id: string, data: Partial<T>): Promise<Result<T>>;
  softDelete(resource: string, id: string): Promise<Result<void>>;
  subscribe(resource: string, callback: (data: T[]) => void): Unsubscribe;
}
```

### Adapter implementation skeleton

```ts
// src/services/api/task.api.ts
import type { BackendAdapter, Result } from "./adapter.types";
import type { Task } from "@/types/task.types";
import { supabase } from "./supabase.client"; // or firebase equivalent

export const taskApi: BackendAdapter<Task> = {
  async getAll(resource) {
    try {
      const { data, error } = await supabase.from(resource).select("*");
      if (error)
        return {
          data: null,
          error: { code: error.code, message: error.message },
        };
      return { data: data as Task[], error: null };
    } catch (e) {
      return { data: null, error: { code: "UNKNOWN", message: String(e) } };
    }
  },
  // ... implement remaining methods
};
```

> → **Cross-reference:** How adapters are called from hooks is shown in [Section 9 — TanStack Query Conventions](#9-tanstack-query-conventions).
> → **Cross-reference:** Backend-specific SDK setup is in [Section 12](#12-backend-rules--supabase--firebase).

---

## 12. Backend Rules — Supabase & Firebase

> Active backend is declared in `project.config.ts`. Read that file first.
> Both backends implement the same `BackendAdapter<T>` interface from [Section 11](#11-backend-adapter-interface).

### Supabase

```ts
// src/services/api/supabase.client.ts — initialized ONCE, imported as singleton
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
    },
  },
);
```

**Supabase rules:**

- ✅ Enable RLS on **ALL** tables — no exceptions, ever
- ✅ Generate types after schema changes: `npx supabase gen types typescript --local > src/types/supabase.types.ts`
- ✅ Always call `channel.unsubscribe()` in `useEffect` cleanup for Realtime
- ❌ Never expose the service role key on the client — not even in dev
- Env vars: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Firebase

```ts
// src/services/api/firebase.client.ts — initialized ONCE with getApps() guard
import { getApp, getApps, initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(), // enables offline persistence
});
```

**Firebase rules:**

- ✅ Always use the **modular SDK** (`firebase/firestore`, not `firebase/compat/firestore`)
- ✅ Enable offline persistence via `persistentLocalCache()` on every project
- ✅ Always return the `onSnapshot` unsubscribe function from `useEffect`
- ✅ Define all Firestore document types manually in `src/types/` (Firestore is schema-less)
- ❌ Never use `firebase/compat/*` imports
- Env vars: `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`, `EXPO_PUBLIC_FIREBASE_APP_ID`

---

## 13. Sync Strategy

| Setting             | Value                                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| Mode                | Eventual consistency                                                                                 |
| Conflict resolution | Last write wins — compared by `updated_at` (ISO 8601)                                                |
| Queue storage       | SQLite table: `mutation_queue`                                                                       |
| Queue fields        | `id`, `uuid`, `table_name`, `operation`, `payload`, `retry_count`, `last_attempted_at`, `created_at` |
| Operations queued   | `INSERT`, `UPDATE`, `DELETE`                                                                         |
| Max retries         | 5                                                                                                    |
| Backoff             | Exponential — base 1s, max 30s: `min(1000 * 2^retry, 30000)`                                         |
| Sync triggers       | App foreground (`AppState`) · Network reconnect (`NetInfo`) · Pull-to-refresh                        |

### `mutation_queue` SQLite schema

```ts
// src/services/db/sync.db.ts — created once on app init alongside feature tables
const CREATE_MUTATION_QUEUE_TABLE = `
  CREATE TABLE IF NOT EXISTS mutation_queue (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid             TEXT    NOT NULL UNIQUE,    ← matches the entity's uuid
    table_name       TEXT    NOT NULL,           ← e.g. 'tasks', 'profiles'
    operation        TEXT    NOT NULL,           ← 'INSERT' | 'UPDATE' | 'DELETE'
    payload          TEXT    NOT NULL,           ← JSON.stringify(entity data)
    retry_count      INTEGER NOT NULL DEFAULT 0,
    last_attempted_at TEXT,                      ← ISO 8601 or NULL if never attempted
    created_at       TEXT    NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_mq_table_name  ON mutation_queue (table_name);
  CREATE INDEX IF NOT EXISTS idx_mq_retry_count ON mutation_queue (retry_count);
`;
```

> The sync worker queries `mutation_queue` ordered by `created_at ASC` — oldest mutations are processed first (FIFO).

### Sync flow

```
1. User action (insert/update/delete)
2. Write to SQLite immediately (optimistic — sync_status = 'pending')
3. Add operation to mutation_queue
4. Return success to UI — user is never blocked
5. Sync worker picks up pending queue items
6. Calls BackendAdapter method with payload
7. On success: set sync_status = 'synced', set server_id if new record, clear sync_error
8. On failure: increment retry_count, set sync_error = error message, schedule retry with backoff
9. After max_retries: set sync_status = 'error' — surface to user (e.g. warning icon on record)
```

> ⚠️ `sync_status = 'error'` is a valid `SyncStatus` value — it is declared in `BaseEntity`.
> Surface failed records via a query: `WHERE sync_status = 'error'` and show a retry affordance in the UI.

### Offline UX rules

- ✅ Show persistent `OfflineBanner` component when `useUIStore((s) => s.isOffline)` is true
- ✅ Queue mutations silently — never block the user from working offline
- ✅ Show last-synced timestamp somewhere visible (Settings screen or subtle header label)
- ❌ Never drop a mutation silently — if it can't sync, it stays in the queue

---

## 14. Error Handling

### Service layer — Result<T> pattern

```ts
// Services NEVER throw. Always return Result<T>.
// Callers never need try/catch — they check result.error.

async function getTask(id: string): Promise<Result<Task>> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("uuid", id)
      .single();
    if (error)
      return {
        data: null,
        error: { code: error.code, message: error.message },
      };
    return { data: data as Task, error: null };
  } catch (e) {
    return { data: null, error: { code: "UNEXPECTED", message: String(e) } };
  }
}
```

### Hook layer — TanStack Query exposes state

```ts
// Hooks surface error state from TQ — never re-throw or swallow
const { data, isLoading, isError, error } = useTaskList();
// Pass isLoading, isError, error as props to feature components
```

### Screen/component layer — friendly UI

```tsx
// Screens render one of three states — never raw error strings
if (isLoading) return <LoadingSpinner />;
if (isError)
  return (
    <ErrorState
      message="Couldn't load tasks. Pull down to retry."
      onRetry={refetch}
    />
  );
if (!data?.length)
  return <EmptyState message="No tasks yet." onAdd={handleAdd} />;
return <TaskList data={data} />;
```

### Logger — central utility, no console.log in production

```ts
// src/utils/logger.ts
const isDev = __DEV__;

export const logger = {
  info: (msg: string, ...args: unknown[]) =>
    isDev && console.log(`[INFO] ${msg}`, ...args),
  warn: (msg: string, ...args: unknown[]) =>
    isDev && console.warn(`[WARN] ${msg}`, ...args),
  error: (msg: string, ...args: unknown[]) =>
    console.error(`[ERROR] ${msg}`, ...args), // always log errors
};
```

### Error handling rules

- ❌ Services must never `throw` — always return `Result<T>`
- ❌ Never display raw `error.message` strings to users
- ❌ Never use `console.log` — always use `logger`
- ✅ Every screen renders explicit loading, error, and empty states
- ✅ Errors logged at the hook layer via `logger.error` in mutation `onError`
- ✅ Network errors: NetInfo listener sets `uiStore.isOffline`, mutations queue to SQLite

> → **Cross-reference:** `Result<T>` type is defined in [Section 11 — Backend Adapter Interface](#11-backend-adapter-interface).

---

## 15. Security

| Rule                      | Detail                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| Sensitive storage         | Use `expo-secure-store` for tokens, passwords, API secrets                               |
| Non-sensitive persistence | `AsyncStorage` is acceptable for theme prefs, onboarding flags                           |
| Input validation          | Validate ALL external data with Zod before use — API responses, route params, deep links |
| Supabase RLS              | Enable Row Level Security on every table — client-side filtering is not a substitute     |
| Service role key          | Never included in client code — not even in `.env.local`                                 |
| Public config             | `EXPO_PUBLIC_` prefix only for non-secret values (URL, project ID)                       |
| Logging                   | Never log tokens, passwords, user PII, or session data — even in dev                     |
| Deep links                | Validate and sanitize all deep link params with Zod before navigation                    |

```ts
// Input validation example — always validate route params with Zod
import { z } from "zod";

const TaskDetailParamsSchema = z.object({
  id: z.string().uuid(),
});

const parsed = TaskDetailParamsSchema.safeParse(route.params);
if (!parsed.success) {
  navigation.goBack(); // reject invalid params
  return null;
}
const { id } = parsed.data; // safe to use
```

---

## 16. Performance

### Rendering

```tsx
// Memoize feature components that receive stable props
export const TaskCard = React.memo(({ task, onPress }: TaskCardProps) => { ... });

// Memoize callbacks passed to memoized children
const handlePress = useCallback((id: string) => navigation.navigate('TaskDetail', { id }), [navigation]);

// Memoize expensive derived values
const completedCount = useMemo(() => tasks.filter((t) => t.is_complete).length, [tasks]);
```

### Lists — always FlatList or FlashList

```tsx
// ❌ WRONG — renders all items, no recycling, kills performance on mobile
<ScrollView>{tasks.map((t) => <TaskCard key={t.uuid} task={t} />)}</ScrollView>

// ✅ CORRECT — virtualised, recycled, performant
<FlashList
  data={tasks}
  renderItem={({ item }) => <TaskCard task={item} onPress={handlePress} />}
  keyExtractor={(item) => item.uuid}
  estimatedItemSize={80}
/>
```

### SQLite

- Use `runAsync` for all write operations to avoid blocking the JS thread
- Use WAL (Write-Ahead Logging) mode: `PRAGMA journal_mode=WAL;` on DB init
- Batch inserts inside a single transaction for sync operations

### Queries

- Default `staleTime`: 2 minutes (override per feature with justification)
- Use `useInfiniteQuery` for any list that can exceed 50 items
- Debounce all search/filter inputs: minimum 300ms before triggering a query

### Performance rules

- ✅ `React.memo` on feature components
- ✅ `useCallback` / `useMemo` when passing to memoized children
- ✅ `FlashList` (preferred) or `FlatList` for ALL lists
- ✅ `runAsync` for SQLite writes
- ✅ WAL mode on SQLite init
- ❌ `map()` inside `ScrollView` — forbidden unconditionally

---

## 17. Naming Conventions

| Type               | Pattern                  | Example                                |
| ------------------ | ------------------------ | -------------------------------------- |
| Screen             | `PascalCase + Screen`    | `TaskListScreen.tsx`                   |
| Stack              | `PascalCase + Stack`     | `HomeStack.tsx`                        |
| Tab navigator      | `PascalCase + Tabs`      | `MainTabs.tsx`                         |
| Param list type    | `PascalCase + ParamList` | `HomeStackParamList`                   |
| Feature types file | `<feature>.types.ts`     | `task.types.ts`                        |
| Base/shared types  | `base.types.ts`          | `BaseEntity`, `SyncStatus`             |
| Mock data          | `<feature>.mock.ts`      | `task.mock.ts`                         |
| Mock hook          | `use<Feature>Mock.ts`    | `useTaskMock.ts`                       |
| Real hook          | `use<Feature>.ts`        | `useTask.ts`                           |
| Query key factory  | `<feature>Keys`          | `taskKeys`                             |
| DB service         | `<feature>.db.ts`        | `task.db.ts`                           |
| API service        | `<feature>.api.ts`       | `task.api.ts`                          |
| Sync service       | `<feature>.sync.ts`      | `task.sync.ts`                         |
| Zustand store      | `<concern>Store.ts`      | `authStore.ts`, `uiStore.ts`           |
| UI component       | `PascalCase.tsx`         | `TaskCard.tsx`, `EmptyState.tsx`       |
| Utility            | `camelCase.ts`           | `formatDate.ts`                        |
| Constant value     | `SCREAMING_SNAKE_CASE`   | `MAX_RETRY_COUNT`                      |
| Zod schema         | `<Feature>Schema`        | `TaskSchema`, `TaskDetailParamsSchema` |
| Adapter type       | `BackendAdapter<T>`      | (fixed name — do not vary)             |

---

## 18. Enforced Build Workflow

```
0.  Read LESSONS.md — apply any relevant corrections before generating
1.  Read project.config.ts — note backend, nav_structure, enable_sync
2.  Read PROJECT.md — note theme tokens, nav map, custom components
3.  Write plan to tasks/todo.md → check in with user
──────────────────────────────────────────────────────────────
    NAVIGATION (first time or adding a new route)
4.  Add route to param list → src/navigation/types.ts
5.  Create/update stack file → src/navigation/stacks/<Name>Stack.tsx
6.  Create/update tab file  → src/navigation/tabs/<Name>Tabs.tsx (if needed)
──────────────────────────────────────────────────────────────
    FEATURE (repeat per feature)
7.  Define entity type extending BaseEntity → src/types/<feature>.types.ts
8.  Generate mock data → src/mocks/<feature>.mock.ts
9.  Build mock hook → src/hooks/use<Feature>Mock.ts
10. Build feature component → src/components/features/<Feature>.tsx
11. Wire screen (loading/error/empty states) → src/screens/<Feature>/<Feature>Screen.tsx
12. Register screen in correct stack file
──────────────────────────────────────────────────────────────
    PERSISTENCE & SYNC
13. Define SQLite schema with indexes → src/services/db/<feature>.db.ts
14. Build backend adapter → src/services/api/<feature>.api.ts
15. Build sync logic → src/services/sync/<feature>.sync.ts (if enable_sync: true)
──────────────────────────────────────────────────────────────
    CUTOVER
16. Swap mock hook for real hook — zero screen/component changes required
──────────────────────────────────────────────────────────────
    WRAP-UP (every session)
17. Run verification → Section 19
18. Update tasks/todo.md — mark complete, add review section
19. Update SUMMARY.md — files generated, decisions made
20. Update LESSONS.md — if any corrections were given this session
```

> ❌ Steps 7–9 (types → mock data → mock hook) must never be skipped.
> ❌ Step 17 (verification) must never be skipped.
> ❌ Expo Router must never be introduced at any step.

---

## 19. Verification Standard

> A task is NOT done until all of these pass. No exceptions.

### Code checks

```bash
npx tsc --noEmit          # zero TypeScript errors
npx expo lint             # zero lint errors
```

### Manual verification checklist

- [ ] Loading state renders correctly (spinner or skeleton)
- [ ] Error state renders correctly (friendly message + retry action)
- [ ] Empty state renders correctly (message + primary CTA)
- [ ] Navigation types are correct — no `any`, no untyped `navigate()`
- [ ] No anti-patterns from [Section 21](#21-anti-patterns) introduced
- [ ] Component works with mock hook before connecting real hook
- [ ] Real hook behaviour matches mock hook shape exactly

### Mobile-specific checks

- [ ] Test on iOS mental model (safe area insets, back gesture)
- [ ] Test on Android mental model (hardware back button, status bar)
- [ ] FlatList/FlashList used for all variable-length lists
- [ ] Offline state handled — mutations queued, banner shown
- [ ] No `console.log` left in changed files — use `logger`

### Senior engineer standard

> Before presenting: _"Would a senior React Native engineer approve this PR without requesting changes?"_
> If the honest answer is **no** — fix it first.

---

## 20. Quality Checklist

### Every screen must have:

- [ ] Typed `useNavigation` (and `useRoute` if params needed)
- [ ] Loading state UI
- [ ] Error state UI — user-friendly message, retry action
- [ ] Empty state UI — message, primary CTA
- [ ] Connected to hook — no direct service or DB calls

### Every feature must have:

- [ ] Entity type extending `BaseEntity` with all required fields
- [ ] Mock data file with realistic sample data
- [ ] Mock hook with loading, error, and empty state variants
- [ ] Real hook using TanStack Query with query key factory
- [ ] Feature component receiving data + callbacks via props
- [ ] SQLite schema with all required fields and indexes

### Every backend service must have:

- [ ] Implements `BackendAdapter<T>` fully
- [ ] Returns `Result<T>` — never throws
- [ ] All methods handled for both Supabase and Firebase paths

---

## 21. Anti-Patterns

> Each item below has caused real bugs. None of them are judgment calls.

| Anti-Pattern                               | Correct Approach                                                  |
| ------------------------------------------ | ----------------------------------------------------------------- |
| Expo Router / `app/` directory             | React Navigation with `navigation/stacks/` and `navigation/tabs/` |
| Untyped `navigation.navigate('Page')`      | Typed navigate using `RootStackParamList` keys                    |
| Passing `navigation` as a prop             | `useNavigation()` inside the component that needs it              |
| Direct SQLite calls in screens             | Call via hook → service/db layer                                  |
| Direct Supabase/Firebase SDK in screens    | Call via hook → `BackendAdapter`                                  |
| Mixing business logic and UI in one file   | Separate hook file + feature component                            |
| Skipping mock layer                        | Mock hook built before real hook — always                         |
| `StyleSheet.create`                        | NativeWind `className` only                                       |
| `useEffect` + `useState` for fetching      | `useQuery` from TanStack Query                                    |
| Inline magic query key strings             | Query key factory (`taskKeys.list()`)                             |
| `any` type                                 | `unknown` + Zod narrowing, or explicit typed interface            |
| Secrets in SQLite                          | `expo-secure-store`                                               |
| Storing server data in Zustand             | TanStack Query cache                                              |
| Hardcoded backend SDK calls in hooks       | `BackendAdapter<T>` interface                                     |
| `map()` inside `ScrollView`                | `FlatList` or `FlashList`                                         |
| Re-initializing Supabase/Firebase per file | Import the singleton client                                       |
| `console.log` in production paths          | `logger.info/warn/error` from `src/utils/logger.ts`               |
| Temporary / patching fixes                 | Root cause fix only                                               |
| Marking done without verification          | Full checklist from [Section 19](#19-verification-standard) first |
| Hard-deleting DB rows                      | `sync_status = 'deleted'` soft delete                             |

---

## 22. Gemini CLI Shortcuts

| Command              | What is generated                                                     |
| -------------------- | --------------------------------------------------------------------- |
| `/feature <name>`    | Types + mock data + mock hook + real hook + feature component         |
| `/screen <name>`     | Typed screen in correct stack, all 3 states (loading/error/empty)     |
| `/stack <name>`      | New file in `navigation/stacks/` with typed param list                |
| `/tabs <name>`       | New file in `navigation/tabs/` with typed tab param list              |
| `/nav`               | Full nav scaffold: `types.ts` + `RootNavigator` + starter stack + tab |
| `/ui <name>`         | Atomic UI component — NativeWind, typed props, no business logic      |
| `/mock <name>`       | Mock data file + mock hook with all state variants                    |
| `/schema <name>`     | SQLite schema with all required fields + indexes                      |
| `/service <name>`    | Backend adapter implementing `BackendAdapter<T>`, returns `Result<T>` |
| `/sync <name>`       | Sync logic — queue reader, exponential backoff, updates `server_id`   |
| `/store <name>`      | Zustand store for a specific UI concern                               |
| `/plan <task>`       | Plan written to `tasks/todo.md`, checks in before building            |
| `/bug <description>` | Root-cause investigation → fix → verify — no hand-holding             |

---

_GLOBAL.md v3.3 — Universal rules only._
_Project values → PROJECT.md · Session progress → SUMMARY.md · Corrections → LESSONS.md_

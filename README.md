# Keypath

Structured touch-typing learning platform.

Product and architecture: [`PROJECT.md`](./PROJECT.md)  
Phased plan: [`BUILD_PLAN.md`](./BUILD_PLAN.md)

## Requirements

- Node.js 20+
- [pnpm](https://pnpm.io/) 10 (`corepack enable` or `npm install -g pnpm`)
- Docker (only when running local Supabase, from Phase 4)

## Setup

```bash
pnpm install
cp .env.example apps/web/.env.local
pnpm dev
```

The web app is at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command          | What it does                     |
| ---------------- | -------------------------------- |
| `pnpm dev`       | Start the Next.js app (Turbo)    |
| `pnpm lint`      | ESLint across workspaces         |
| `pnpm typecheck` | `tsc --noEmit` across workspaces |
| `pnpm test`      | Vitest across workspaces         |
| `pnpm build`     | Production build                 |
| `pnpm format`    | Prettier                         |

## Monorepo

```text
apps/web                 Next.js App Router
packages/typing-engine   Keystroke engine (no React)
packages/curriculum      Worlds and lessons
packages/scoring         Stars, XP, mastery
packages/shared-types    Shared DTOs
packages/ui              Thin shared UI (keyboard in Phase 2)
```

Local Supabase (`supabase start`) is not required until Phase 4.

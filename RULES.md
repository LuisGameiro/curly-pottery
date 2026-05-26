# Curly Pottery — AI Agent Rules

> This file documents conventions and patterns for AI agents working on this codebase.
> When making changes, follow these rules strictly. When adding new patterns, update this file.

---

## CSS Modules — Tailwind Directives

**Every CSS module file MUST include both `@reference` directives at the top:**

```css
@reference "tailwindcss";
@reference "../../../globals.css";
```

**Relative path to `globals.css` depends on nesting depth:**

- `components/common/Foo/Foo.module.css` → `../../../globals.css`
- `components/common/Foo/Bar/Bar.module.css` → `../../../../globals.css`
- `components/ui/Button/Button.module.css` → `../../../../globals.css`

**Why:** Tailwind CSS v4 requires these directives so `@apply` can resolve theme utilities (colors, spacing, etc.) defined in `globals.css`.

**Rule:** Never use `@apply` without the two `@reference` directives. Never remove them if you're editing an existing file.

---

## Import Paths

### Always use path aliases (never relative paths for aliases)

```typescript
// ✅ Correct
import { Button } from '@components/ui'
import { useUser } from '@lib/hooks/useUser'
import { getServerSession } from 'next-auth'

// ❌ Incorrect — relative paths to aliased locations
import Button from '../../ui/Button/Button'
import { useUser } from '../../../lib/hooks/useUser'
```

### Server Actions

Server action files live in `actions/` directory and use **bare paths** (no `@` alias):

```typescript
// ✅ Correct
import { getCartFromDbAction } from '@actions/cart.actions'
import { addFavouriteAction } from '@actions/Favourite.actions'

// ❌ Incorrect — using @ alias for actions
import { getCartFromDbAction } from '@actions/cart.actions'
```

**Rule:** Import from `actions/` using `'@actions/Foo.actions'` — no `@actions` prefix.

---

## Server Actions

### File naming

- Use **PascalCase** for the filename: `Cart.actions.ts`, `Favourite.actions.ts`
- Each action file is a single `'use server'` module
- Export async functions that perform DB operations

### Structure

```typescript
'use server'

import { authOptions } from '@lib/auth/authOptions'
import { getServerSession } from 'next-auth'
import { prisma } from 'prisma/prisma'
import { revalidatePath } from 'next/cache'

export async function someAction() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  // DB operations via prisma
  // Always call revalidatePath() after mutations
}
```

### After Prisma schema changes

After modifying `prisma/schema.prisma`, always run:

```bash
npx prisma generate
npx prisma db push
```

---

## Components

### Directory structure

```
components/
  common/           # Shared components (Navbar, Footer, Layout, etc.)
  ui/               # Primitive UI (Button, Input, Text, etc.)
  product/          # Product-specific (ProductCard, ProductSidebar, etc.)
  admin/            # Admin-specific
  cart/             # Cart-specific
  checkout/         # Checkout-specific
```

### Each component has its own folder

```
components/ui/Button/
  Button.tsx        # Component implementation
  Button.module.css # CSS module (required!)
  index.ts          # Barrel export (see below)
```

### Barrel exports

**Component-level `index.ts`** (re-export from folder):

```typescript
export { default } from './Button'
export * from './Button'
```

**Category-level `index.ts`** (combine multiple components):

```typescript
// components/common/index.ts
export { default as Navbar } from './Navbar'
export { default as Footer } from './Footer'
export { default as UserNav } from './UserNav'
export { default as SearchBar } from './SearchBar/SearchBar' // Use path to .tsx, not folder
export { default as NewsletterBanner } from './NewsletterBanner/NewsletterBanner'
```

**Rule:** When a component lives in a subfolder (e.g., `SearchBar/SearchBar.tsx`), the barrel export in the parent `index.ts` must point to the `.tsx` file directly, not the folder, to avoid casing issues with TypeScript module resolution.

### Named exports alongside default

```typescript
// Button.tsx
export interface ButtonProps { ... }
export default function Button(...) { ... }

// Sub-components exported via named exports
export function LoadingDots() { ... }
```

### Importing components

```typescript
// ✅ Preferred — import from category barrel
import { Button, Text, Collapse } from '@components/ui'

// ✅ Also allowed — direct import with path alias
import Button from '@components/ui/Button/Button'
```

---

## Zustand Stores

### File location

`lib/zustand/` directory. One store per file, e.g., `cart.ts`, `favourites.ts`.

### Pattern — always use `persist` middleware

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface Store {
  items: string[]
  addItem: (item: string) => void
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: async (item: string) => {
        const { items } = get()
        set({ items: [...items, item] })
      },
    }),
    {
      name: 'store-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated?.(true)
      },
    },
  ),
)
```

### Store must include `isHydrated` state

For any store using `persist`, add a `setHydrated` function and `isHydrated: boolean` to track when localStorage has been read:

```typescript
interface Store {
  items: string[]
  isHydrated: boolean // ← required for persist
  setHydrated: (state: boolean) => void
}
```

### Hydration pattern in hooks

```typescript
// lib/hooks/useStore.ts
export default function useStore() {
  const store = useStore()

  useEffect(() => {
    // Sync with DB once hydrated and authenticated
    if (store.isHydrated) {
      store.syncWithDatabase()
    }
  }, [store.isHydrated])

  return store
}
```

---

## TypeScript

- Strict mode enabled
- No implicit `any` — always annotate
- Use `interface` for object shapes, `type` for unions/primitives
- Path aliases in `tsconfig.json`:
  ```json
  {
    "@lib/*": ["lib/*"],
    "@components/*": ["components/*"],
    "@actions/*": ["actions/*"]
  }
  ```

---

## CSS / Tailwind Theme

**All theme colors are defined as CSS custom properties in `globals.css`:**

| Variable                          | Light              | Dark      |
| --------------------------------- | ------------------ | --------- |
| `--primary`                       | `#fde372` (yellow) | same      |
| `--secondary`                     | `#3b67d4` (blue)   | `#5d87e9` |
| `--background`                    | `#f1fbff`          | `#05070a` |
| `--muted`                         | `#6a808b`          | same      |
| `--border`                        | `#d1e5f0`          | `#1e324d` |
| `--accent-0` through `--accent-9` | light → dark scale |           |

**Rule:** Use existing theme variables. Never invent new color names like `text-blue-500` — use `text-secondary`, `text-primary`, etc. If a color doesn't exist in the theme, propose adding it in `globals.css` instead.

**Theme-aware classes:** Use `dark:` and `light:` variants (defined via `@custom-variant dark`).

---

## File Naming Conventions

| Type             | Convention              | Example                                   |
| ---------------- | ----------------------- | ----------------------------------------- |
| Server actions   | `PascalCase.actions.ts` | `Cart.actions.ts`, `Favourite.actions.ts` |
| Components       | `PascalCase.tsx`        | `ProductSidebar.tsx`                      |
| CSS modules      | `PascalCase.module.css` | `ProductSidebar.module.css`               |
| Hooks            | `camelCase.ts`          | `useFavourites.ts`, `useCart.ts`          |
| Zustand stores   | `camelCase.ts`          | `cart.ts`, `favourites.ts`                |
| Types/interfaces | `PascalCase.ts`         | `lib/types/types.ts`                      |

---

## Next.js App Router

- Use `'use client'` directive only when component uses browser APIs, hooks, or event handlers
- Server components are the default — don't add `'use client'` unless needed
- Server actions use `'use server'` at top of file
- Use `next/navigation` (`useRouter`, `usePathname`) — NOT `next/router` (that's Pages Router)
- Use `next/link` `<Link>` component — never `<a>` for internal navigation

---

## Auth — Next Auth v4

- Use `useUser()` hook from `@lib/hooks/useUser` for client-side auth state
- Use `getServerSession(authOptions)` in server components and actions
- Session user object has: `id`, `email`, `firstName`, `lastName`, `role`

---

## Linting, Type Checking, Formatting

Run before committing:

```bash
npm run check    # runs lint && typecheck && format:check
npm run lint:fix # auto-fix lint issues
npm run format:fix # auto-fix prettier issues
```

**Pre-commit hook** (Husky) runs `lint:fix`, `format:fix`, `typecheck`.
**Pre-push hook** runs `npm run check`.

**Prettier config:** `semi: false`, `singleQuote: true`, `tabWidth: 2`.

---

## Testing

- **Framework:** Jest 30 + React Testing Library
- **Pattern:** Co-located tests next to source files
  - `actions/cart.actions.ts` → `actions/cart.actions.test.ts`
  - `lib/hooks/useCart.ts` → `lib/hooks/useCart.test.ts`
- **Commands:**
  - `npm test` — run all tests
  - `npm run test:watch` — watch mode
  - `npm run test:ci` — CI with coverage

---

## Environment Variables

- Never commit `.env` (contains secrets)
- Use `.env.local.example` as template for required env vars
- Required secrets: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `RESEND_API_KEY`
- Optional: Klarna credentials, SumUp credentials, Google OAuth

---

## Error Handling

- Use custom error classes from `lib/errors.ts` (`AppError`, `DatabaseError`, `InsufficientStockError`, etc.)
- Use structured responses `{ success: boolean, data?: T, message: string }` in server actions
- Use `toast()` from `sonner` for user-facing error messages in client components
- Always handle loading and error states in UI

---

## State Management Priority

1. **React state** (`useState`) — simple local state
2. **Zustand** — cross-component state that needs persistence (cart, favourites)
3. **Server state / SWR pattern** — data that comes from DB (use cart hook pattern)
4. **Context** — only when a provider is truly global (theme, auth)

---

## When Adding New Features

1. Create the component in the appropriate `components/` subdirectory
2. Add CSS module with `@reference "tailwindcss"` + `@reference` to `globals.css`
3. Export from component-level `index.ts` and category-level `index.ts`
4. Add server actions in `actions/` with `'use server'` directive
5. Add Zustand store if persistence needed (include `isHydrated`)
6. Update `RULES.md` if introducing a new pattern
7. Ensure `npm run check` passes before finishing

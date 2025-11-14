# Rate My Pokémon - AI Coding Agent Instructions

## Architecture Overview

This is a **React 18 + TypeScript + Vite** Pokédex application with Supabase backend, featuring a rating system, gamified filtering, and Google OAuth authentication.

### Core Data Flow
- **PokéAPI Integration**: `src/lib/pokemon.ts` streams national Pokédex via `streamNationalDex()` in batches of 24
- **Dual Storage**: Ratings stored in both Supabase (when authenticated) and localStorage (always) using positive/negative dex encoding for shiny variants
- **State Management**: Single App.tsx manages all state with `useState` - no external state library
- **Routing**: Hash-based routing via `useHashRoute()` hook, not React Router

### Key Architectural Patterns

#### Shiny Variant Encoding
Shiny Pokémon use negative dex numbers as storage keys (e.g., Pikachu shiny uses key -25). This enables separate ratings for normal vs shiny forms without additional fields.

#### Infinite Scroll Implementation
Uses `IntersectionObserver` with sentinel element to progressively load cards:
```typescript
// In App.tsx - always start with 60 visible, expand by 60
const [visibleCount, setVisibleCount] = useState<number>(60);
const visible = filtered.slice(0, visibleCount);
```

#### Evolution Chain Loading
`fetchMonFromListItem()` in `pokemon.ts` enriches base PokéAPI data by:
1. Fetching evolution chains from species data
2. Adding mega evolutions from species varieties
3. Deduplicating entries to prevent duplicate mega forms

## Development Workflows

### Development Commands
```bash
npm run dev        # Runs clean-src-js.js then starts Vite dev server on port 5174
npm run build      # TypeScript compilation then Vite build
npm test           # Vitest with jsdom environment
npm run test:watch # Vitest in watch mode
```

### Pre-Development Cleanup
The `scripts/clean-src-js.js` automatically removes stale `.js` files from `src/` before every dev server start to prevent TypeScript compilation conflicts.

### Database Migrations
Supabase migrations in `supabase/migrations/` define:
- `user_ratings` table with RLS policies
- `rating_events` table for historical tracking
- Indexes optimized for user lookups and timeline queries

## Project-Specific Conventions

### Component Architecture
- **Atomic Design**: `components/Atoms.tsx` contains base primitives (`Card`, `Pressable`)
- **Page Components**: `PokemonPage.tsx` handles detail view with evolution trees
- **Filter System**: `Filters.tsx` implements gamified UI with live count badges

### Styling System
- **CSS Variables**: All theme tokens defined in `:root` of `index.css`
- **Type Colors**: Each Pokémon type has gradient variants (e.g., `.type-FIRE`)
- **Tailwind + Custom CSS**: Utility classes for layout, custom CSS for complex animations
- **Design Tokens**: Uses CSS variable `--bg-app` with a light base color and a card elevation system

### State Patterns
- **Filter State**: Multiple `Set<string>` for types, generations, categories with toggle functions
- **Ratings State**: `Record<number, number>` mapping dex to score (negative keys for shiny)
- **Auth State**: Custom `AuthUser` interface wrapping Supabase session data

### API Integration Patterns
```typescript
// PokéAPI batching pattern used throughout pokemon.ts
const step = 24;
for (let i = 0; i < items.length; i += step) {
  const part = await Promise.all(slice.map(fetchMonFromListItem));
  onBatch(part);
}
```

## Critical Integration Points

### Supabase Configuration
- OAuth redirect: `window.location.origin` 
- RLS policies: Users can only access their own ratings/events
- Environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Google OAuth Setup
- Requires Google Cloud Console OAuth client setup
- Supabase provider configuration with exact redirect URIs
- See `GOOGLE_OAUTH_SETUP.md` for complete setup steps

### PokéAPI Rate Limiting
- Concurrent request limit: 12 parallel requests via `chunkMap()`
- AbortController used for request cancellation
- Fallback seed data in `SEED` array for immediate UI loading

## Testing & Quality

### Test Setup
- **Vitest** with jsdom environment for React component testing
- **React Testing Library** for component interaction testing
- Test files in `src/__tests__/` (currently `Filters.test.tsx`)

### Type Safety
- Strict TypeScript configuration via `tsconfig.json`
- Custom type definitions: `Mon`, `AuthUser`, `UserProfile`, `Flags`
- Environment type definitions in `vite-env.d.ts`

## Performance Considerations

### Optimization Strategies
- **Memoization**: `useMemo` for expensive filter computations
- **Virtualization**: Infinite scroll prevents DOM bloat with large datasets  
- **Image Loading**: Pokémon sprites loaded on-demand with `loading="lazy"`
- **Local Storage**: Persistent ratings reduce server requests

### Bundle Management
- Vite for fast HMR and optimized production builds
- Dynamic imports not used - single bundle strategy
- CSS purging via Tailwind for smaller stylesheets

## Error Handling Patterns

### Network Resilience
- PokéAPI failures: Graceful degradation with seed data
- Supabase errors: Console logging with user-visible error states
- AbortController: Request cancellation for route changes

### User Experience
- Loading states for all async operations
- Error boundaries via `ErrorBoundary.tsx` component
- Toast notifications for rating confirmations and errors

---

*For OAuth setup details, see `GOOGLE_OAUTH_SETUP.md`. For database schema, see `supabase/migrations/`.*
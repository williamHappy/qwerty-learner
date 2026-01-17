# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Qwerty Learner is a React-based typing practice application for keyboard workers to memorize English words and build muscle memory. It combines vocabulary learning with typing practice, supporting multiple dictionaries (CET-4/6, GRE, IELTS, programming APIs, etc.) and deployment platforms (web, uTools plugin).

## Development Commands

### Basic Development
- `yarn dev` or `yarn start` - Start development server (localhost:5173)
- `yarn build` - Build for web deployment
- `yarn lint` - Run ESLint
- `yarn prettier` - Format code with Prettier

### uTools Plugin Development
- `yarn build:utools` - Build for uTools plugin (copies selected assets via `copy-utools-assets.js`)
- `yarn utools:dev` - Start dev server for uTools (port 5173)
- `yarn utools:copy-assets` - Run the uTools asset copy script independently

### Testing
- `yarn test:e2e` - Run Playwright end-to-end tests
- `yarn test` - No tests configured currently

## Architecture

### State Management
The application uses **Jotai** for state management with two patterns:

1. **Global Atoms** (`src/store/index.ts`):
   - Configuration atoms using `atomWithStorage` for persistence
   - Dictionary selection, user preferences, theme settings
   - Derive atoms using `atom((get) => ...)` pattern for computed values

2. **Local Page State** (e.g., `src/pages/Typing/store/`):
   - Context + Reducer pattern for complex typing state
   - Manages chapter data, timer, typing progress, user input logs
   - Uses Immer for immutable state updates

### Routing Strategy
- **React Router v6** with dynamic router selection
- `HashRouter` for uTools environment, `BrowserRouter` for web
- Lazy loading for Analysis and Gallery pages
- Mobile detection redirects to appropriate views

### Page Structure
Each page in `src/pages/` follows a consistent pattern:
- `index.tsx` - Main page component
- `components/` - Page-specific components
- `hooks/` - Custom hooks for page logic
- `store/` - Local state management (if needed)

Core pages:
- **Typing** (`/`) - Main typing practice interface
- **Analysis** - Progress visualization with activity calendar and charts
- **Gallery** - Achievement showcase
- **ErrorBook** - Review mode for incorrect words

### Component Architecture
- **Radix UI** primitives as foundation (Dialog, Dropdown, Tabs, etc.)
- **Tailwind CSS** with custom design system
- **Headless UI** for additional components
- Custom components in `src/components/` for shared UI elements

### Data Layer
- **Dexie** (IndexedDB wrapper) for client-side database
- Stores review records, user progress
- Export/import functionality for data portability
- `src/utils/db/` contains database schemas and utilities

### Dictionary System
Dictionaries are JSON files in `public/dicts/` with structure:
```typescript
{
  name: string;
  description: string;
  length: number;
  category: string;
  data: Word[];  // 20 words per chapter
}
```

Dictionary metadata is registered in `src/resources/dictionary.ts`. The application dynamically loads dictionary data from the public directory.

### Sound System
Multi-layered audio using **Howler.js**:
- Key press sounds (mechanical keyboard, etc.)
- Correct/wrong feedback sounds
- Word pronunciation (US/UK accents via YouDao API)
- Background music support
- Volume controls per sound type in `src/store/index.ts`

## Build Configuration

### Vite Setup (`vite.config.ts`)
- **Conditional builds**: Web vs uTools via `BUILD_TARGET=utools` environment variable
- **uTools plugin**: Strips analytics, modifies HTML, disables public dir copy
- **Bundle analysis**: Rollup visualizer plugin
- **Jotai plugins**: Debug labels and React Fast Refresh
- **Path aliases**: `@/` → `src/`
- **Console removal**: Drops console/debugger in production builds

### uTools Integration
Located in `utools/` directory:
- `plugin.json` - uTools plugin manifest
- `preload.js` - uTools API integration
- `copy-utools-assets.js` - Selective asset copying to meet 20MB size limit

The build script selectively copies dictionaries (core English + programming APIs) and sound files to minimize plugin size.

### Tailwind Configuration
- Dark mode with class strategy
- Custom dimensions for precise layout control
- Headless UI and forms plugins
- Special screen sizes for dictionary layouts
- Custom animations in `tailwind.config.js`

## Key Technical Patterns

### Typing Engine
The core typing logic (`src/pages/Typing/store/`):
- Tracks user input per letter with mistake counts
- Calculates WPM (words per minute) and accuracy
- Enforces correct input before proceeding (no error reinforcement)
- Supports loop word mode and random chapter mode
- Records detailed logs for review in ErrorBook

### Configuration Persistence
Uses `atomForConfig` wrapper for user preferences:
- Persists to localStorage
- Provides default values
- Type-safe configuration objects
- Easy to add new config items

### Mobile Detection
Application detects mobile devices and redirects to appropriate views. The typing interface is primarily designed for desktop/keyboard usage.

### Pronunciation System
- Fetches audio from YouDao Dictionary API
- Supports US/UK pronunciation types
- Configurable playback rate and volume
- Optional translation reading feature

## Testing

### E2E Testing
- **Playwright** for end-to-end tests
- Test files should be in standard Playwright locations
- Run with `yarn test:e2e`

### Code Quality
- **ESLint** with React and Prettier integration
- **Husky** git hooks for pre-commit checks
- **lint-staged** runs Prettier on staged files
- Import sorting via `@trivago/prettier-plugin-sort-imports`

## Adding New Dictionaries

1. Create JSON file in `public/dicts/` following the dictionary structure
2. Add metadata to `src/resources/dictionary.ts`
3. For uTools builds, add to `utoolsDicts` array in `scripts/copy-utools-assets.js`
4. Test dictionary loading and chapter navigation

See `docs/toBuildDict.md` for detailed dictionary creation guidelines.

## Common Patterns

### Adding New User Preferences
```typescript
// In src/store/index.ts
export const newConfigAtom = atomForConfig('newConfig', {
  // default values
})

// In component
const [config, setConfig] = useAtom(newConfigAtom)
```

### Creating New Pages
1. Add directory in `src/pages/YourPage/`
2. Create `index.tsx` and necessary components
3. Add route in `src/index.tsx` (lazy load if not critical)
4. Add navigation link in appropriate place (Header, Settings, etc.)

### Typing State Management
When modifying typing behavior, work with:
- `src/pages/Typing/store/index.ts` - Reducer actions and state
- `src/pages/Typing/store/type.ts` - Type definitions
- Ensure Immer patterns are used for state updates

## Platform-Specific Considerations

### uTools Plugin
- Size limit: 20MB (use `copy-utools-assets.js` to manage)
- No external network calls in HTML (stripped by build plugin)
- Preload script exposes uTools APIs
- All resources must be bundled locally

### Web Deployment
- Uses Vercel Analytics
- Supports external network calls
- Public directory copied to build
- GitHub Pages compatible (uses `base: ./`)

## Code Style

- **Prettier** with import sorting
- **CamelCase** for CSS modules (configured in Vite)
- **Functional components** with hooks
- **TypeScript** strict mode enabled
- **Tailwind** utility classes for styling (prefer utility classes over custom CSS)

## Important Notes

- Dictionary chapter size: 20 words per chapter (standard across all dictionaries)
- Typing enforces correctness: wrong characters must be re-entered (prevents muscle memory errors)
- All state changes should go through defined actions or atoms
- When adding new features, consider both web and uTools platforms
- Test dark mode compatibility (uses `isOpenDarkModeAtom`)
- Mobile views are simplified; focus on desktop keyboard experience

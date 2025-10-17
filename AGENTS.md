# Agent Guidelines for Mark Board

## Project Terminology

- **US/us**: Abbreviation for "user story" (e.g., "implement US 6.4", "US co-create integration")

## Build/Lint/Test Commands

**Always use Bun, never npm.**

- **Build**: `bun run build` (TypeScript compilation + Vite build)
- **Lint**: `bun run lint` (ESLint with React/TypeScript rules, 0 warnings allowed)
- **Test all**: `bun test` (Jest with jsdom environment)
- **Test single file**: `bun test -- src/components/Card.test.tsx`
- **Test single spec**: `bun test -- --testNamePattern="renders card with all metadata"`
- **Test watch**: `bun run test:watch`
- **Test coverage**: `bun run test:coverage`
- **Format**: `bun run format:fix` (Prettier with project config)
- **Dev server**: `bun run dev`

## Code Style Guidelines

### TypeScript/React

- Strict TypeScript enabled (`"strict": true`)
- Functional components with hooks
- Interface definitions for all component props
- Async/await for asynchronous operations
- Error handling with `try/catch` and `instanceof Error` checks

### Imports

- React imports first
- Third-party libraries second
- Local imports last (relative paths)
- Group imports by type with blank lines

### Naming Conventions

- **Components**: PascalCase (e.g., `Card`, `Board`)
- **Functions/Variables**: camelCase (e.g., `handleDelete`, `isLoading`)
- **Types/Interfaces**: PascalCase (e.g., `CardProps`, `BoardState`)
- **Files**: PascalCase for components, camelCase for utilities
- **Directories**: kebab-case (e.g., `file-operations.ts`)

### Formatting (Prettier)

- No semicolons
- Single quotes
- 2-space indentation
- 80 character line width
- Trailing commas (ES5 style)
- Avoid arrow function parentheses when possible

### State Management

- Zustand stores for global state
- Actions defined in store interfaces
- Optimistic updates with error rollback

### Styling

- Tailwind CSS classes
- Dark mode support with `dark:` prefixes
- Responsive design with Tailwind breakpoints
- Component-scoped styling

### Testing

- Jest with React Testing Library
- Component tests in `__tests__/` directories
- Mock external dependencies (e.g., `@dnd-kit`)
- Descriptive test names and assertions

### File Operations

- Async file operations with proper error handling
- JSDoc comments for exported functions
- Consistent file path handling

### Error Handling

- User-friendly error messages in UI
- Console logging for debugging
- Graceful fallbacks for failed operations

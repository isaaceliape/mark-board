# Implementation Plan - Markdown Kanban Board

## Phase 1: Project Setup & Foundation (Week 1)

### 1.1 Initialize Project

- [x] Create React + TypeScript project with Vite
- [x] Configure ESLint, Prettier, and TypeScript strict mode
- [x] Set up project structure (src/, kanban-data/, etc.)
- [x] Initialize Git repository with .gitignore
- [x] Create README.md with setup instructions

### 1.2 Install Core Dependencies

```bash
bun install react react-dom
bun install -D @types/react @types/react-dom
bun install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
bun install chokidar gray-matter remark remark-parse
bun install zustand
bun install tailwindcss postcss autoprefixer
```

### 1.3 Create Initial Folder Structure

```
kanban-data/
├── backlog/
├── in-progress/
└── done/
```

## Phase 2: Core Utilities & Services (Week 1-2)

### 2.1 Markdown Parser (`src/utils/markdownParser.ts`)

- [x] Parse markdown files with frontmatter extraction
- [x] Convert frontmatter to Card metadata
- [x] Validate markdown structure
- [x] Generate unique IDs from filenames
- [x] Handle malformed markdown gracefully

### 2.2 File Operations (`src/utils/fileOperations.ts`)

- [x] Read markdown files from directory
- [x] Write card data to markdown file
- [x] Move files between folders (column changes)
- [x] Delete markdown files
- [x] Create new markdown files with template
- [x] Handle file naming conflicts

### 2.3 File Watcher Hook (`src/hooks/useFileWatcher.ts`)

- [x] Initialize chokidar watcher on kanban-data/
- [x] Listen for add/change/unlink events
- [x] Debounce rapid file changes
- [x] Update store on file system changes
- [x] Handle watcher cleanup on unmount

## Phase 3: State Management (Week 2)

### 3.1 Board Store (`src/stores/boardStore.ts`)

- [x] Define Card and Column interfaces
- [x] Create Zustand store with initial state
- [x] Implement actions:
  - [x] loadCards() - Initialize from file system
  - [x] addCard(card) - Create new card
  - [x] updateCard(id, updates) - Edit card content
  - [x] moveCard(id, targetColumn) - Move between columns
  - [x] deleteCard(id) - Remove card
  - [x] syncFromFileSystem() - Handle external changes
- [x] Add error state management
- [x] Add loading states

## Phase 4: UI Components (Week 2-3)

### 4.1 Card Component (`src/components/Card.tsx`)

- [x] Display card title and preview
- [x] Show metadata badges (tags, assignee, due date)
- [x] Implement click-to-edit mode
- [x] Add delete button with confirmation
- [x] Style with Tailwind CSS
- [x] Add drag handle indicator
- [ ] Implement keyboard navigation

### 4.2 Card Editor (`src/components/CardEditor.tsx`)

- [x] Inline markdown editor with textarea
- [ ] Live markdown preview toggle
- [x] Metadata form fields (tags, assignee, due date)
- [x] Save/Cancel buttons
- [ ] Auto-save on blur with debounce
- [x] Validation and error messages

### 4.3 Column Component (`src/components/Column.tsx`)

- [x] Render column header with title
- [x] Display card count
- [x] Render cards in vertical list
- [x] Add "New Card" button
- [x] Implement drop zone styling
- [x] Handle empty state

### 4.4 Board Component (`src/components/Board.tsx`)

- [x] Render all columns horizontally
- [x] Implement @dnd-kit drag and drop context
- [x] Handle drag start/end events
- [x] Update store on successful drop
- [x] Show loading spinner during initial load
- [x] Display error messages
- [ ] Add sync status indicator

## Phase 5: Drag & Drop Integration (Week 3)

### 5.1 Drag & Drop Hook (`src/hooks/useDragDrop.ts`)

- [x] Configure @dnd-kit sensors (mouse, touch, keyboard)
- [x] Implement handleDragStart callback
- [x] Implement handleDragEnd callback
- [x] Optimistic UI updates
- [x] Rollback on file operation failure
- [x] Visual feedback during drag

### 5.2 Integration with File System

- [x] Move markdown file to new folder on drop
- [x] Update card metadata with new column
- [x] Handle move failures gracefully
- [x] Prevent concurrent move operations

## Phase 6: Advanced Features (Week 4)

### 6.1 Search & Filter

- [ ] Add search bar component
- [ ] Filter cards by title/content
- [ ] Filter by tags
- [ ] Filter by assignee
- [ ] Clear filters button

### 6.2 Keyboard Shortcuts

- [ ] 'n' - Create new card
- [ ] 'e' - Edit selected card
- [ ] 'Delete' - Remove selected card
- [ ] Arrow keys - Navigate cards
- [ ] 'Esc' - Cancel edit mode

### 6.3 Performance Optimizations

- [ ] Implement virtual scrolling for large card lists
- [ ] Memoize expensive computations
- [ ] Debounce file operations
- [ ] Lazy load card content

## Phase 7: Testing & Polish (Week 4-5)

### 7.1 Unit Tests

- [ ] Test markdown parser edge cases
- [ ] Test file operations with mock fs
- [ ] Test store actions and state updates
- [ ] Test component rendering

### 7.2 Integration Tests

- [ ] Test drag and drop flow end-to-end
- [ ] Test file watcher synchronization
- [ ] Test concurrent edit scenarios

### 7.3 UI/UX Polish

- [ ] Add animations and transitions
- [ ] Improve mobile responsiveness
- [ ] Add dark mode support
- [ ] Implement toggle button in top right corner for dark/light mode
- [ ] Create app icon and branding
- [ ] Write user documentation

## Phase 8: Deployment (Week 5)

### 8.1 Build Configuration

- [ ] Optimize Vite production build
- [ ] Configure environment variables
- [ ] Add build scripts to package.json

### 8.2 Deployment Options

- [ ] Electron wrapper for desktop app
- [ ] Or: Tauri for lightweight desktop app
- [ ] Or: Web app with backend API for file operations

## Milestones

- **Week 1**: ✅ Project setup complete, can read markdown files
- **Week 2**: ✅ Basic board displays cards from file system
- **Week 3**: ✅ Drag & drop working, file watcher active
- **Week 4**: ✅ Full CRUD operations, editing works
- **Week 5**: ✅ Polished, tested, deployed

## Technical Decisions

### File Naming Convention

- Filename format: `{timestamp}-{slug}.md`
- Example: `1697123456789-implement-user-auth.md`
- Title derived from frontmatter or first heading

### Markdown File Template

```markdown
---
title: Card Title
created: 2024-01-01T00:00:00Z
updated: 2024-01-01T00:00:00Z
tags: [feature, backend]
assignee: John Doe
dueDate: 2024-01-15
---

# Card Title

Card content goes here with full markdown support.

## Checklist

- [ ] Task 1
- [ ] Task 2
```

### Error Handling Strategy

- File read errors: Show error badge on card
- File write errors: Rollback UI state, show toast notification
- Watcher errors: Attempt reconnection with exponential backoff
- Parse errors: Display card with warning, show raw content

## Risk Mitigation

- **Concurrent edits**: Implement file locking or last-write-wins with warnings
- **Large boards**: Virtual scrolling and pagination
- **File system limits**: Warn when approaching OS file limits
- **Cross-platform paths**: Use path.join() and normalize separators

# Markdown Kanban Board - Project Specification

## Project Overview
A visual kanban board application that reads and manages markdown files organized in folder-based columns (backlog, in-progress, done). The board provides real-time file watching, drag-and-drop card manipulation, and inline editing capabilities.

## Core Features
- **File-based Storage**: Cards stored as individual markdown files in organized folders
- **Real-time Sync**: File system watcher detects changes and updates board automatically  
- **Drag & Drop**: Intuitive card movement between columns with visual feedback
- **Inline Editing**: Click-to-edit card content with markdown support
- **Column Management**: Dynamic column creation/renaming based on folder structure
- **Card Metadata**: Support for due dates, tags, assignees in frontmatter

## Technical Requirements
- **Frontend**: React with drag-and-drop library (react-beautiful-dnd or @dnd-kit)
- **File Watching**: chokidar for efficient file system monitoring
- **Markdown Parsing**: remark/remark-parse for frontmatter and content extraction
- **State Management**: Zustand or Redux for board state
- **Styling**: Tailwind CSS or styled-components for responsive design
- **Build Tool**: Vite for fast development and optimized builds

## File Structure
```
project/
├── src/
│   ├── components/
│   │   ├── Board.tsx
│   │   ├── Column.tsx
│   │   ├── Card.tsx
│   │   └── CardEditor.tsx
│   ├── hooks/
│   │   ├── useFileWatcher.ts
│   │   └── useDragDrop.ts
│   ├── utils/
│   │   ├── markdownParser.ts
│   │   └── fileOperations.ts
│   └── stores/
│       └── boardStore.ts
├── kanban-data/
│   ├── backlog/
│   ├── in-progress/
│   └── done/
└── package.json
```

## Data Model
```typescript
interface Card {
  id: string;
  title: string;
  content: string;
  column: string;
  filePath: string;
  metadata: {
    created: Date;
    updated: Date;
    tags?: string[];
    assignee?: string;
    dueDate?: Date;
  };
}

interface Column {
  id: string;
  title: string;
  cards: Card[];
}
```

## Key Implementation Details
- **File Watching**: Monitor kanban-data/ directory for create/update/delete events
- **Drag & Drop**: Column-to-column movement with optimistic updates and rollback on failure
- **Markdown Format**: YAML frontmatter for metadata, markdown body for content
- **Conflict Resolution**: Handle concurrent file edits with last-write-wins strategy
- **Performance**: Virtual scrolling for large boards, debounced file operations

## User Experience
- Cards display as compact previews with expand-on-click functionality
- Keyboard shortcuts for quick actions (delete, move, edit)
- Visual indicators for unsaved changes and sync status
- Responsive design supporting mobile drag-and-drop

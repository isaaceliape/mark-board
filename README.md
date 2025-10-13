# Mark Board

A visual kanban board application that manages tasks using markdown files organized in folders.

## Features

- 📁 File-based storage with markdown files
- 🔄 Real-time file system synchronization
- 🖱️ Drag and drop cards between columns
- ✏️ Inline editing with markdown support
- 🏷️ Support for tags, assignees, and due dates

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
bun install
```

### Development

```bash
bun run dev
```

### Build

```bash
bun run build
```

### Preview Production Build

```bash
bun run preview
```

## Project Structure

```
mark-board/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── stores/         # State management
│   └── types.ts        # TypeScript type definitions
├── kanban-data/        # Markdown files storage
│   ├── backlog/
│   ├── in-progress/
│   └── done/
└── public/             # Static assets
```

## Markdown File Format

Cards are stored as markdown files with YAML frontmatter:

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

Card content with full markdown support.

## Checklist
- [ ] Task 1
- [ ] Task 2
```

## License

MIT

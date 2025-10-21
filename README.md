# Mark Board

A visual kanban board application that manages tasks using markdown files organized in folders.

![Board Screenshot 1](/public/Screenshot.png)

![Board Screenshot 2](src/assets/Screenshot%202.png)

## Features

### Core Functionality

- 📁 File-based storage with markdown files
- 🔄 Real-time file system synchronization
- 🖱️ Drag and drop cards between columns
- ✏️ Modal-based card creation and editing
- 🏷️ Support for tags, assignees, and due dates
- 🔍 Advanced search and filtering by title, content, tags, and assignees
- 🎨 Dark/light theme support with system preference detection

### AI-Powered Features

- 🤖 AI-powered user story co-creator with chat interface
- 🔄 One-click card editing with AI assistance
- 📝 Live markdown preview and formatting shortcuts
- 💬 Context-aware AI conversations for story refinement
- ⚙️ Configurable AI integration with OpenAI

### Keyboard & Navigation

- ⌨️ Comprehensive keyboard shortcuts (n, e, Delete, arrows, Esc)
- 🎯 Command palette with Cmd+K (Ctrl+K) activation
- 🗂️ Quick card navigation and selection from command palette
- 🗑️ Delete any card with confirmation from command palette
- ✏️ Create new cards via command palette
- 🐧 VIM-style navigation (j/k for up/down, h for back)
- 📜 Auto-scrolling in card selection lists

### Performance & UX

- ⚡ Optimized rendering with React.memo and useMemo
- 🔄 Debounced search and file operations
- 🎯 Smooth scrolling and keyboard navigation
- 📱 Responsive design for different screen sizes

## Getting Started

### Prerequisites

- Node.js 18+ and bun

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

## AI Features

Mark Board includes powerful AI-assisted features for creating and refining user stories:

### 🤖 Co-Creator Page

- **AI Chat Interface**: Interactive chat with AI for generating and refining user stories
- **Prompt Templates**: Pre-built templates for user stories and acceptance criteria
- **Live Markdown Editor**: Real-time preview with formatting shortcuts
- **Conversation Persistence**: Save and resume AI conversations
- **Export to Board**: Create new cards or update existing ones directly from the editor

### 🔄 Card Integration

- **One-Click Editing**: Click the 🤖 icon on any card to open it in the co-creator
- **Pre-loaded Content**: Existing card data is automatically loaded into the editor
- **Context-Aware AI**: AI understands when you're editing existing cards
- **Seamless Workflow**: Move between board view and AI editing effortlessly

### ⚙️ Configuration

Set your OpenAI API key as `VITE_OPENAI_API_KEY` for AI features. If unset, the app runs in mock mode for demonstration.

### 🎨 Theme Behavior

Mark Board automatically detects and follows your system's light/dark preference on first visit. The theme will also update live when you change your OS preference, unless you've manually toggled the theme. Manual theme choices are saved and take precedence over system settings.

## Project Structure

```
mark-board/
├── src/
│   ├── components/     # React components
│   │   ├── Board.tsx   # Main kanban board
│   │   ├── Card.tsx    # Individual cards with AI integration
│   │   ├── CoCreator.tsx # AI-powered story editor
│   │   ├── ChatInterface.tsx # AI chat component
│   │   └── ...
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   │   ├── aiService.ts # AI provider integration
│   │   └── ...
│   ├── stores/         # State management
│   ├── types/          # TypeScript type definitions
│   │   ├── ai.ts       # AI-related types
│   │   └── ...
│   └── types.ts        # Main type definitions
├── kanban-data/        # Markdown files storage
│   ├── backlog/        # New user stories
│   ├── in-progress/    # Active work
│   └── done/           # Completed items
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

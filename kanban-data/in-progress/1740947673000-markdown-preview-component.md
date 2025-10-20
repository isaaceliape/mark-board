---
title: Markdown Preview Component
created: 2025-01-20T20:00:00Z
updated: 2025-01-20T20:00:00Z
tags: [feature, ui, markdown]
assignee:
dueDate:
---

# Markdown Preview Component

As a user, I want to see a rendered preview of markdown content in user stories and cards so that I can easily read formatted content without parsing raw markdown syntax.

## Acceptance Criteria

- Component renders markdown to HTML with proper formatting (headers, lists, code blocks, links, etc.)
- Component uses a markdown rendering library (e.g., `react-markdown`, `marked`, or `remark`)
- Preview respects dark mode theme with appropriate styling
- Syntax highlighting for code blocks (if present in markdown)
- Component is reusable and can be used in Card, CardEditor, and CoCreator views
- Preview updates reactively when markdown content changes
- Sanitizes HTML output to prevent XSS attacks
- Supports GitHub-flavored markdown features (tables, task lists, strikethrough)
- Responsive design that works on mobile and desktop
- Maintains consistent typography with the rest of the application

## Technical Notes

- Consider using `react-markdown` with `remark-gfm` for GitHub-flavored markdown
- Use `react-syntax-highlighter` or similar for code block syntax highlighting
- Ensure the preview component accepts a `content` prop with the markdown string
- Add Tailwind classes for consistent styling with dark mode support
- Component should be added to `src/components/MarkdownPreview.tsx`

## Use Cases

1. **Card View**: Show formatted content preview in card component
2. **Card Editor**: Display live preview alongside markdown editor
3. **Co-Creator**: Show AI-generated markdown in formatted view
4. **Modal View**: Render full card content when viewing details

## Dependencies

- Install markdown rendering library: `bun add react-markdown remark-gfm`
- Optional: `bun add react-syntax-highlighter @types/react-syntax-highlighter`

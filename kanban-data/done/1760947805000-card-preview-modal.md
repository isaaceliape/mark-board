---
title: Card Preview Modal
created: 2025-01-20T20:03:00Z
updated: 2025-01-20T20:03:00Z
tags: [feature, ui, ux]
assignee:
dueDate:
---

# Card Preview Modal

As a user, I want to see a read-only preview of card content when clicking on a card so that I can quickly read formatted markdown without entering edit mode.

## User Story

Currently, clicking on a card opens the CardEditor component for editing. This should be changed to open a read-only preview modal that displays the rendered markdown content. Users should have an explicit "Edit" button to enter edit mode.

## Acceptance Criteria

- Clicking on a card opens a preview modal instead of the CardEditor
- Modal displays the card title prominently
- Modal uses the MarkdownPreview component (from US 1740947673000) to render card content
- Modal shows all card metadata (tags, assignee, due date, created/updated dates)
- Modal has an "Edit" button that opens the CardEditor modal
- Modal has a "Delete" button with confirmation
- Modal has a "Close" button and can be closed with Escape key
- Modal supports keyboard navigation (Tab, Escape)
- Modal is responsive and works on mobile devices
- Modal respects dark mode theme
- Clicking outside the modal closes it
- The edit keyboard shortcut ('e') still works to directly open the editor

## Implementation Details

1. Create new component `src/components/CardPreviewModal.tsx`
2. Update `Board.tsx` to:
   - Show CardPreviewModal when clicking a card
   - Show CardEditor only when clicking "Edit" button in preview or pressing 'e' shortcut
3. Update `Card.tsx` to remove direct edit on click, trigger preview instead
4. CardPreviewModal should have:
   - Header with title and close button
   - Metadata section (tags, assignee, due date)
   - Main content area using MarkdownPreview component
   - Footer with "Edit" and "Delete" buttons
   - Timestamps (created/updated) in footer

## Dependencies

- Requires completion of US 1740947673000 (Markdown Preview Component)

## Design Notes

```
┌─────────────────────────────────────────┐
│  Card Title                          ×  │
├─────────────────────────────────────────┤
│  [tag1] [tag2] [@assignee] [Due: ...]  │
├─────────────────────────────────────────┤
│                                         │
│  [Rendered Markdown Content]            │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│  Created: ... | Updated: ...            │
│                    [Edit]  [Delete]     │
└─────────────────────────────────────────┘
```

## Behavior Changes

- **Before**: Click card → CardEditor opens
- **After**: Click card → CardPreviewModal opens → Click "Edit" → CardEditor opens

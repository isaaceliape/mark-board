---
title: 6.5 Card Co-Create Integration
created: 2025-10-17T10:00:00Z
updated: 2025-10-17T10:00:00Z
tags: [user-story, phase-6, integration, ui]
assignee:
dueDate:
---

# 6.5 Card Co-Create Integration

As a user, I want to click an icon on each card to open it in the co-create page so that I can easily edit and refine existing user stories with AI assistance.

## Acceptance Criteria

- Add small icon (e.g., 🤖 or ✏️) in bottom right corner of each card
- Icon only visible on hover to keep cards clean
- Clicking icon navigates to `/co-create` with card content pre-loaded
- Editor pre-populates with existing card title and content
- Chat interface shows context about editing existing card
- Preserve card metadata (tags, assignee, due date) in co-create session
- Return to board after export maintains card position
- Icon styling matches overall design system
- Works on both light and dark themes
- Responsive design for mobile devices

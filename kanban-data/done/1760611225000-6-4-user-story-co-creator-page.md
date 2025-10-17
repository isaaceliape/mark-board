---
title: 6.4 User Story Co-Creator Page
created: 2025-10-16T10:40:38Z
updated: 2025-10-16T10:40:38Z
tags: [user-story, phase-6, ai]
assignee:
dueDate:
---

# 6.4 User Story Co-Creator Page

As a product team, we want to co-create user stories with AI so that we can quickly generate well-structured stories and acceptance criteria.

## Acceptance Criteria

- Route `/co-create` and navigation entry
- Left: AI chat; Right: markdown editor with resizable split
- Chat UI supports streaming via provider-agnostic adapter
- Prompt templates for user stories and acceptance criteria
- Conversation state persisted; reset and transcript save available
- Editor includes live preview and formatting shortcuts
- One-click insert/replace/apply-diff from chat into editor
- Export creates new backlog card with frontmatter
- Handles rate limits/retries with user-facing toasts
- Config reads `VITE_AI_API_KEY`; mock mode when unset

---
title: 4.5 Auto Theme Detection (System Preference)
created: 2025-10-16T11:15:00Z
updated: 2025-10-16T11:15:00Z
tags: [user-story, phase-4, ui, theme]
assignee:
dueDate:
---

# 4.5 Auto Theme Detection (System Preference)

As a user, I want the application to automatically match my system light/dark preference, while preserving any manual theme choice I make, so the UI feels consistent and respectful of my OS settings.

## Acceptance Criteria

- Initial load respects OS preference when no explicit user preference is saved.
  - Detect via `window.matchMedia('(prefers-color-scheme: dark)')`.
  - Apply the corresponding `dark` class strategy used by Tailwind (on `document.documentElement`).
- Live updates when the OS preference changes.
  - Listen for `change` events on the `matchMedia` query.
  - Only auto-switch if the user has not manually overridden the theme.
- Manual toggle override continues to work and persists.
  - When the user toggles the theme, persist the choice in local storage (e.g., `theme = 'light' | 'dark'`).
  - On subsequent loads, a saved manual choice takes precedence over system preference.
- No noticeable theme flash on first paint.
  - Apply the chosen theme class as early as possible (e.g., minimal inline script in `index.html` or early bootstrap) to avoid FOUC.
- Accessibility & UX
  - The theme toggle reflects the active theme state accurately.
  - Keyboard and screen reader users can discover and use the control.
- Documentation
  - Briefly document the behavior and override rules in README or a short developer note.

## Notes

- Consider optionally supporting a "System" mode in the toggle to explicitly follow OS settings; if not implemented, default to system when no saved preference exists and treat any toggle as a manual override.
- Ensure Tailwind `dark` mode is configured with the `class` strategy (not `media`) to allow controlled switching.
